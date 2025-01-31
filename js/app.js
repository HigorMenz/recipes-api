function startApp() {
  const selectCat = document.querySelector("#categorias");

  if (selectCat) {
    selectCat.addEventListener("change", selectCategory);
    getCategories();
  }
  const resultCard = document.querySelector("#resultado");

  const savedDiv = document.querySelector(".favoritos");
  if (savedDiv) {
    getSaveRecipes();
  }

  const modal = new bootstrap.Modal("#modal", {});

  //show categories on option tag
  function getCategories() {
    const url = "https://www.themealdb.com/api/json/v1/1/categories.php";

    //chama api
    fetch(url)
      .then((response) => response.json())
      .then((result) => showCategories(result.categories));
  }
  function showCategories(categories = []) {
    categories.forEach((category) => {
      const option = document.createElement("OPTION");

      option.value = category.strCategory;
      option.textContent = category.strCategory;
      selectCat.appendChild(option);
    });
  }

  //show recipes selected on option form
  function selectCategory(e) {
    const category = e.target.value;
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;
    fetch(url)
      .then((response) => response.json())
      .then((result) => showRecipes(result.meals));
  }

  //create recipe cards to show on screen
  function showRecipes(recipes = []) {
    cleanHtml(resultCard);

    const heading = document.createElement("H2");
    heading.classList.add("text-center", "text-black", "my-5");
    heading.textContent = recipes.length
      ? "Found Recipes"
      : "No Recipes Found.";
    resultCard.appendChild(heading);
    //iterar resultados
    recipes.forEach((recipe) => {
      const recipeContainer = document.createElement("DIV");
      recipeContainer.classList.add("col-md-4");

      const recipeCard = document.createElement("DIV");
      recipeCard.classList.add("card", "mb-4");

      const recipeImg = document.createElement("IMG");
      recipeImg.classList.add("card-img-top");
      recipeImg.alt = `recipe image ${recipe.strMeal ?? recipe.title} `;
      recipeImg.src = recipe.strMealThumb ?? recipe.img;

      const recipeCardBody = document.createElement("DIV");
      recipeCardBody.classList.add("card-body");

      const recipeHeading = document.createElement("H3");
      recipeHeading.classList.add("card-title", "mb-3");
      recipeHeading.textContent = recipe.strMeal ?? recipe.title;

      const recipeBtn = document.createElement("BUTTON");
      recipeBtn.classList.add("btn", "btn-danger", "w-100");
      recipeBtn.textContent = "Show Recipe";

      //generate a modal on click, contains recipes info
      recipeBtn.onclick = function () {
        selectRecipe(recipe.idMeal ?? recipe.id);
      };

      //add card on html
      recipeCardBody.appendChild(recipeHeading);
      recipeCardBody.appendChild(recipeBtn);

      recipeCard.appendChild(recipeImg);
      recipeCard.appendChild(recipeCardBody);

      recipeContainer.appendChild(recipeCard);

      resultCard.appendChild(recipeContainer);
    });
  }

  //open recipe info onclick "view more"
  function selectRecipe(id) {
    const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
    fetch(url)
      .then((response) => response.json())
      .then((result) => showModalRecipe(result.meals[0]));
  }

  function showModalRecipe(recipe) {
    const { idMeal, strInstructions, strMeal, strMealThumb } = recipe;

    //add content on modal
    const modalTitle = document.querySelector(".modal .modal-title");
    const modalBody = document.querySelector(".modal .modal-body");

    modalTitle.textContent = strMeal;

    modalBody.innerHTML = `
      <img class = "img-fluid" src="${strMealThumb}" alt="recipe ${strMeal}" />
      <h3>Instructions </h3>
      <p>${strInstructions}</p>
      <h3 class="my-3">Ingredients and Measures</h3>
    `;

    const listGroup = document.createElement("UL");
    listGroup.classList.add("list-group");
    //add ingredients
    for (let i = 1; i <= 20; i++) {
      if (recipe[`strIngredient${i}`]) {
        const ingredients = recipe[`strIngredient${i}`];
        const measure = recipe[`strMeasure${i}`];

        const ingredientsLi = document.createElement("LI");
        ingredientsLi.classList.add("list-group-item");
        ingredientsLi.textContent = `${ingredients} - ${measure}`;

        listGroup.appendChild(ingredientsLi);
      }
    }
    modalBody.appendChild(listGroup);
    const modalFooter = document.querySelector(".modal-footer");
    cleanHtml(modalFooter);

    //save and close buttons

    const saveBtn = document.createElement("BUTTON");
    saveBtn.classList.add("btn", "btn-danger", "col");
    saveBtn.textContent = alreadyExists(idMeal)
      ? "Remove Recipe"
      : "Save Recipe";

    //save on local storage
    saveBtn.onclick = function () {
      if (alreadyExists(idMeal)) {
        deleteSaved(idMeal);
        saveBtn.textContent = "Save Recipe";
        alertToast("Recipe removed successfuly");
        return;
      }

      saveRecipe({
        id: recipe.idMeal,
        title: recipe.strMeal,
        img: recipe.strMealThumb,
      });
      saveBtn.textContent = "Remove Recipe";
      alertToast("Recipe saved successfuly");
    };

    const closeBtn = document.createElement("BUTTON");
    closeBtn.classList.add("btn", "btn-secondary", "col");
    closeBtn.textContent = "Close";
    closeBtn.onclick = function () {
      modal.hide();
    };

    modalFooter.appendChild(saveBtn);
    modalFooter.appendChild(closeBtn);

    modal.show();
  }

  function saveRecipe(recipe) {
    const savedRecipes = JSON.parse(localStorage.getItem("savedRecipes")) ?? [];
    localStorage.setItem(
      "savedRecipes",
      JSON.stringify([...savedRecipes, recipe])
    );
  }
  function deleteSaved(id) {
    const savedRecipes = JSON.parse(localStorage.getItem("savedRecipes")) ?? [];
    //retorna resultado diferente do id passado(que foi excluído)
    const newSaved = savedRecipes.filter((saved) => saved.id !== id);

    localStorage.setItem("savedRecipes", JSON.stringify(newSaved));
  }

  function alreadyExists(id) {
    const savedRecipes = JSON.parse(localStorage.getItem("savedRecipes")) ?? [];
    //itera sobre o objeto e busca se ja tem um objeto com esse id
    return savedRecipes.some((saved) => saved.id === id);
  }

  function getSaveRecipes() {
    const savedRecipes = JSON.parse(localStorage.getItem("savedRecipes")) ?? [];
    console.log(savedRecipes);
    if (savedRecipes.length) {
      showRecipes(savedRecipes);
      return;
    }
    const noSave = document.createElement("P");
    noSave.textContent = "You don't have any saved recipes";
    noSave.classList.add("fs-4", "text-center", "font-bold", "mt-5");
    savedDiv.appendChild(noSave);
  }

  function cleanHtml(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  }

  function alertToast(message) {
    const toastDiv = document.querySelector("#toast");
    const toastBody = document.querySelector(".toast-body");
    const toast = new bootstrap.Toast(toastDiv);

    toastBody.textContent = message;

    toast.show();
  }
}

document.addEventListener("DOMContentLoaded", startApp);

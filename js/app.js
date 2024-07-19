function startApp() {
  getCategories();

  function getCategories() {
    const url = "https://www.themealdb.com/api/json/v1/1/categories.php";

    //chama api
    fetch(url)
      .then((response) => response.json())
      .then((result) => showCategories(result));
  }
  function showCategories(cat = []){
    console.log(cat);
    
  }
}

document.addEventListener("DOMContentLoaded", startApp);

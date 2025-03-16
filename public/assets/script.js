//Posielanie dát z formulára pridať knihu do BE
$(document).ready(function () {
  $("#saveBook").click(function () {
    //získavanie údajov z inputov
    let title = $("#bookTitle").val();
    let author = $("#bookAuthor").val();
    let readDate = $("#bookReadDate").val();
    let rating = $("#bookRating").val();
    let coverId = $("#bookCoverId").val();

    //Skontrolujeme či sú všetky polia vyplnené
    if (!title || !author || !readDate || !rating || !coverId) {
      alert("Prosím, vyplň všetky polia !");
      return;
    }

    //Posielanie dát na server cez AJAX (Express route "/add")
    $.post("/add", {
      title: title,
      author: author,
      readDate: readDate,
      rating: rating,
      internalcoverid: coverId
    }, function(response) {
      console.log("✅ Kniha úspešne pridaná!", response);

      //vyčisti formulár
      $("#addBookForm")[0].reset();

      //Skry modal po úspešnom pridaní
      console.log("Reloading page...");
      $("exampleModalCenter").modal("hide");

      //obnov stránku aby sa zobrazila nová kniha
      location.reload();
    });
  });
});

//Posielame dáta z buttonu pre vymazanie karty knihy
$(document).ready(function () {
  $(".deleteBook").click(function () {
    let bookId = $(this).data("id"); //získame id knihy

    if(confirm("Naozaj chceš túto knihu vymazať ?")) { //overenie
      $.ajax({
        url: "/delete/" + bookId, //odošleme DELETE request
        type: "DELETE",
        success: function (response) {
          console.log("✅ Kniha úspešne vymazaná!", response);
          location.reload(); //obnovíme stránku
        },
        error: function (error) {
          console.error("❌ Chyba pri mazaní knihy:", error);
        }
      })
    }
  });
});

//Dáta z search baru
$(document).ready(function () {
  $("#findBook").click(function () {
    let title = $("#searchBar").val();


    if (!title) {
      alert("Prosím zadaj čo chceš vyhľadať");
      return;
    }

    //presmerovanie na /search s query parametrom
    window.location.href = "/search?query=" + encodeURIComponent(title);
  });
});
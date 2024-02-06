document.addEventListener("DOMContentLoaded", function () {
  let gameList = document.querySelector(".ul");

  function showGames(category) {
    let gameItems = Array.from(gameList.children);
    gameItems.sort(function (a, b) {
      let rankA = parseInt(a.getAttribute("data-rank-" + category));
      let rankB = parseInt(b.getAttribute("data-rank-" + category));
      return rankA - rankB;
    });

    gameItems.forEach(function (item) {
      item.style.display = "none";
      let gameInfo = item.querySelector(".game-info");
      if (gameInfo) {
        gameInfo.style.display = "none";
      }
    });

    if (category === "all") {
      gameItems.sort(function (a, b) {
        let rankA = parseInt(a.getAttribute("data-rank-all"));
        let rankB = parseInt(b.getAttribute("data-rank-all"));
        return rankB - rankA;
      });
      gameItems.forEach(function (item) {
        item.style.display = "block";
        let gameInfo = item.querySelector(".game-info");
        if (gameInfo) {
          gameInfo.style.display = "block";
        }
      });
    } else if (category === "others") {
      gameItems.forEach(function (item) {
        let rank = parseInt(item.getAttribute("data-rank-others"));
        if (rank >= 6 && rank <= 11) {
          item.style.display = "block";
          let gameInfo = item.querySelector(".game-info");
          if (gameInfo) {
            gameInfo.style.display = "block";
          }
        } else {
          item.style.display = "none";
          let gameInfo = item.querySelector(".game-info");
          if (gameInfo) {
            gameInfo.style.display = "none";
          }
        }
      });
    } else {
      gameItems.slice(0, parseInt(category)).forEach(function (item) {
        item.style.display = "block";
        let gameInfo = item.querySelector(".game-info");
        if (gameInfo) {
          gameInfo.style.display = "block";
        }
      });
    }
  }

  let homeLink = document.querySelector(".nav_links ul li:first-child a");
  if (homeLink) {
    homeLink.addEventListener("click", function (event) {
      event.preventDefault();
      showGames("");
    });
  }

  let navLinks = document.querySelectorAll(".nav_links ul li a");
  navLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      let category = link.getAttribute("data-rank");
      showGames(category);
    });
  });

  let othersLink = document.querySelector('[data-rank="others"]');
  if (othersLink) {
    othersLink.addEventListener("click", function (event) {
      event.preventDefault();
      showGames("others");
    });
  }

  let listItems = document.querySelectorAll(".li");

  let arrayItems = Array.from(listItems);

  arrayItems.sort(function (a, b) {
    let rankA = parseInt(
      a.getAttribute("data-rank-10") ||
        a.getAttribute("data-rank-5") ||
        a.getAttribute("data-rank-3") ||
        a.getAttribute("data-rank-1") ||
        0
    );
    let rankB = parseInt(
      b.getAttribute("data-rank-10") ||
        b.getAttribute("data-rank-5") ||
        b.getAttribute("data-rank-3") ||
        b.getAttribute("data-rank-1") ||
        0
    );
    return rankB - rankA;
  });

  let ul = document.querySelector(".ul");
  ul.innerHTML = "";
  arrayItems.forEach(function (item) {
    ul.appendChild(item);
  });
  showGames("others");
});

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
            gameItems.reverse().forEach(function (item) {
                item.style.display = "block";
                let gameInfo = item.querySelector(".game-info");
                if (gameInfo) {
                    gameInfo.style.display = "block";
                }
            });
        } else if (category === "others") {
            gameItems.slice(5).forEach(function (item) {
                item.style.display = "block";
                let gameInfo = item.querySelector(".game-info");
                if (gameInfo) {
                    gameInfo.style.display = "block";
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
            showGames("all");
        });
    }

    showGames("all");

    let navLinks = document.querySelectorAll(".nav_links ul li a");
    navLinks.forEach(function (link) {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            let category = link.getAttribute("data-rank");
            showGames(category);
        });
    });
});
 
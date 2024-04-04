function openModal_carousel() {
    document.getElementById("carousel-admin-modal").classList.add("open");
}

function openModal_square() {
    document.getElementById("square-admin-modal").classList.add("open");
}

document.getElementById("carousel-button-close").addEventListener("click",
    function () {
        document.getElementById("carousel-admin-modal").classList.remove("open")
    }
)

document.getElementById("square-button-close").addEventListener("click",
    function () {
        document.getElementById("square-admin-modal").classList.remove("open")
    }
)
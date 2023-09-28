const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");
const pageNumber = document.getElementById("page");

let currentPage = 1;

// nextBtn.setAttribute("disabled", false);
// prevBtn.setAttribute("disabled", false);

nextBtn.addEventListener("click", () => {
  pageNumber.innerText(currentPage++);
});
prevBtn.addEventListener("click", () => {
  pageNumber.innerText(currentPage--);
});
window.addEventListener("next_log_page", (evt) => {});
window.addEventListener("prev_log_page", (evt) => {});

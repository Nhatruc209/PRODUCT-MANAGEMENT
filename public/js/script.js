// Button Status
const buttonStatus = document.querySelectorAll('[button-status]');
if (buttonStatus.length > 0) {

    buttonStatus.forEach(button => {
        button.addEventListener('click', () => {
            const status = button.getAttribute('button-status');
            const url = new URL(window.location.href);
            if (status) {
                url.searchParams.set('status', status);
            } else {
                url.searchParams.delete('status');
            }
            window.location.href = url.toString();
        });
})}


// From Search
const formSearch = document.querySelector("#form-search");

if(formSearch) {
    let url = new URL(window.location.href);

    formSearch.addEventListener("submit", (e) => {
        e.preventDefault();

        const keyword = e.target.elements.keyword.value;

        if(keyword) {
            url.searchParams.set("keyword", keyword);
        } else {
            url.searchParams.delete("keyword");
        }

        window.location.href = url.href;
    });
}
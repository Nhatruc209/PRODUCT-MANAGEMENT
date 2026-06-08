(() => {
    const messageAlerts = document.querySelectorAll("[message-alert]");

    if (messageAlerts.length > 0) {
        setTimeout(() => {
            messageAlerts.forEach(alert => {
                alert.classList.remove("show");
                setTimeout(() => alert.remove(), 300);
            });
        }, 3000);
    }

    const buttonStatus = document.querySelectorAll("[button-status]");

    if (buttonStatus.length > 0) {
        buttonStatus.forEach(button => {
            button.addEventListener("click", () => {
                const status = button.getAttribute("button-status");
                const url = new URL(window.location.href);

                if (status) {
                    url.searchParams.set("status", status);
                } else {
                    url.searchParams.delete("status");
                }

                window.location.href = url.toString();
            });
        });
    }

    const formSearch = document.querySelector("#form-search");

    if (formSearch) {
        const url = new URL(window.location.href);

        formSearch.addEventListener("submit", event => {
            event.preventDefault();

            const keyword = event.target.elements.keyword.value;

            if (keyword) {
                url.searchParams.set("keyword", keyword);
            } else {
                url.searchParams.delete("keyword");
            }

            window.location.href = url.href;
        });
    }

    const buttonsPagination = document.querySelectorAll("[button-pagination]");

    if (buttonsPagination.length > 0) {
        const url = new URL(window.location.href);

        buttonsPagination.forEach(button => {
            button.addEventListener("click", () => {
                const page = button.getAttribute("button-pagination");
                url.searchParams.set("page", page);
                window.location.href = url.href;
            });
        });
    }

    const checkboxMulti = document.querySelector("[checkbox-multi]");

    if (checkboxMulti) {
        const inputCheckAll = checkboxMulti.querySelector("input[name='checkall']");
        const inputsId = checkboxMulti.querySelectorAll("input[name='id']");

        if (inputCheckAll) {
            inputCheckAll.addEventListener("change", () => {
                inputsId.forEach(input => {
                    input.checked = inputCheckAll.checked;
                });
            });
        }

        inputsId.forEach(input => {
            input.addEventListener("change", () => {
                const countChecked = checkboxMulti.querySelectorAll("input[name='id']:checked").length;

                if (inputCheckAll) {
                    inputCheckAll.checked = countChecked === inputsId.length;
                }
            });
        });
    }

    const formChangeProducts = document.querySelector("[form-change-products]");

    if (formChangeProducts) {
        formChangeProducts.addEventListener("submit", event => {
            event.preventDefault();

            const inputsChecked = document.querySelectorAll("[checkbox-multi] input[name='id']:checked");

            if (inputsChecked.length === 0) {
                alert("Vui lòng chọn ít nhất một sản phẩm!");
                return;
            }

            const type = formChangeProducts.querySelector("select[name='type']").value;
            const inputIds = formChangeProducts.querySelector("input[name='ids']");
            const ids = [];

            inputsChecked.forEach(input => {
                const id = input.value;

                if (type === "change-position") {
                    const inputPosition = document.querySelector(`[position-product='${id}']`);
                    const position = inputPosition ? inputPosition.value : 0;
                    ids.push(`${id}-${position}`);
                } else {
                    ids.push(id);
                }
            });

            inputIds.value = ids.join(",");
            formChangeProducts.submit();
        });
    }

    const formChangeMulti = document.querySelector("[form-change-multi]");

    if (formChangeMulti) {
        formChangeMulti.addEventListener("submit", event => {
            event.preventDefault();

            const tableCheckboxMulti = document.querySelector("[checkbox-multi]");
            const inputsChecked = tableCheckboxMulti ? tableCheckboxMulti.querySelectorAll("input[name='id']:checked") : [];

            if (inputsChecked.length === 0) {
                alert("Vui lòng chọn ít nhất một bản ghi!");
                return;
            }

            const inputIds = formChangeMulti.querySelector("input[name='ids']");
            const ids = [];

            inputsChecked.forEach(input => {
                ids.push(input.value);
            });

            inputIds.value = ids.join(",");
            formChangeMulti.submit();
        });
    }

    const buttonsChangeStatus = document.querySelectorAll("[button-change-status]");

    if (buttonsChangeStatus.length > 0) {
        const formChangeStatus = document.querySelector("#form-change-status");

        if (formChangeStatus) {
            const path = formChangeStatus.getAttribute("data-path");

            buttonsChangeStatus.forEach(button => {
                button.addEventListener("click", () => {
                    const statusCurrent = button.getAttribute("data-status");
                    const id = button.getAttribute("data-id");
                    const statusChange = statusCurrent === "active" ? "inactive" : "active";

                    formChangeStatus.action = `${path}/${statusChange}/${id}?_method=PATCH`;
                    formChangeStatus.submit();
                });
            });
        }
    }

    const buttonsDelete = document.querySelectorAll("[button-delete]");

    if (buttonsDelete.length > 0) {
        const formDeleteItem = document.querySelector("#form-delete-item");

        if (formDeleteItem) {
            const path = formDeleteItem.getAttribute("data-path");

            buttonsDelete.forEach(button => {
                button.addEventListener("click", () => {
                    const isConfirm = confirm("Bạn có chắc muốn xóa sản phẩm này?");

                    if (isConfirm) {
                        const id = button.getAttribute("data-id");
                        formDeleteItem.action = `${path}/${id}?_method=DELETE`;
                        formDeleteItem.submit();
                    }
                });
            });
        }
    }
})();

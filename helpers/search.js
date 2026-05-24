module.exports = (query) => {
    let objectSearch = {
      keyword: "" 
    }
    ;
    // Đọc doc của regex
        if(query.keyword) {
            objectSearch.keyword = query.keyword;
            
            const regex = new RegExp(objectSearch.keyword, "i");
            objectSearch.regex = regex;
        }
    return objectSearch;
} 
export function saveOfflineProduct(product) {

    const products = JSON.parse(
        localStorage.getItem("offlineProducts") || "[]"
    );

    products.push(product);

    localStorage.setItem(
        "offlineProducts",
        JSON.stringify(products)
    );

}
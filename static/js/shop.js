const prod_reg = [
    {
        id: "prod_001",
        prod_name: "Agurk",
        price: "8 kr",
    },
    {
        id: "prod_002",
        prod_name: "Vannmelon",
        price: "40 kr",
    },
    {
        id: "prod_003",
        prod_name: "Paprika",
        price: "12 kr",
    },
    {
        id: "prod_004",
        prod_name: "Honningmelon",
        price: "45 kr",
    },
    {
        id: "prod_005",
        prod_name: "Mais",
        price: "15 kr",
    },
    {
        id: "prod_006",
        prod_name: "Selerirot",
        price: "18 kr",
    },
];

if (localStorage.getItem("cart")) {
    var cart = JSON.parse(localStorage.getItem("cart"))
}
else {
    cart = {}
}


show_product_list()
show_cart()


function show_product_list() {

    let prod_list = document.getElementById("product_list");
    prod_reg.forEach(product => {
        // Create container
        let item_container = document.createElement("div")
        item_container.id = product.id
        item_container.classList.add("product")
        
        
        // Create child elements
        let heading = document.createElement("h2")
        let price = document.createElement("p")
        let add_to_cart_btn = document.createElement("button")
        let remove_from_cart_btn = document.createElement("button")
        let clear_from_cart_btn = document.createElement("button")
        
        // Heading, price tag and image
        heading.innerHTML = product.prod_name
        price.innerHTML = product.price
        
        // Add, clear and remove buttons
        add_to_cart_btn.innerHTML = "+"
        add_to_cart_btn.addEventListener("click", () => update_cart(product, "a"))
        
        remove_from_cart_btn.innerHTML = "-"
        remove_from_cart_btn.addEventListener("click", () => update_cart(product, "r"))
   
        clear_from_cart_btn.innerHTML = "⊖"
        clear_from_cart_btn.addEventListener("click", () => update_cart(product, "c"))

        



        // Add child elements to parent container 
        add_to_item_cont = [
            heading,
            price,
            remove_from_cart_btn,
            clear_from_cart_btn,
            add_to_cart_btn,
        ]

        add_to_item_cont.forEach(element => {
            item_container.appendChild(element)
        })
        

        prod_list.appendChild(item_container)
    });
};


function update_cart(prod, func) {    
    if (!cart[prod.id]) {
        cart[prod.id] = {id: prod.id, prod_name: prod.prod_name, count: 0};
    }
    
    switch(func) {
        case "a":
            cart[prod.id].count += 1
            break;

        case "r":
            cart[prod.id].count -= 1
            if (cart[prod.id].count <= 0) {
                delete cart[prod.id]
            }
            break;

        case "c":
            delete cart[prod.id];
            break;

        default:
            console.error(`Function to update cart "${func}" does not exist.`)
    }
    
    
    localStorage.setItem('cart', JSON.stringify(cart))
    show_cart()
}

function show_cart() {
    let cart_view_el = document.getElementById("cart_items");
    cart_view_el.innerHTML = '';

    Object.keys(cart).forEach(prod_id => {
        const item = cart[prod_id];
        let itemEl = document.createElement('div');
        itemEl.textContent = `${item.prod_name}: ${item.count}`;
        cart_view_el.appendChild(itemEl);
    });
}

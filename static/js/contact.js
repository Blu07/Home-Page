
function validateForm() {
    var checkboxes = document.getElementsByName("Dish");
    var isChecked = false;
    
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            isChecked = true;
            break;
        }
    }
    
    if (!isChecked) {
        alert("Please select at least one dish.");
        return false;
    }
    
    return true;
}
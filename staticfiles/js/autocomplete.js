$(function() {
    $("#search-input").autocomplete({
        source: "/suggest-player/",  // Assicurati che l'URL sia corretto
        minLength: 2,
        select: function(event, ui) {
            $(this).val(ui.item.label);
            return false;
        }
    });
});

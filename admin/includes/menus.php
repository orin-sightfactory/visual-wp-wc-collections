<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

global $vwp_menu_items , $vwp_post_id;


/*$description_fields = array(
    array("label" => "Description", "key" => "description" ,"type" => "textarea", "attr_maxlength" => 500 , "required" => false , "layout" => "col-12" , "notes" => ""),
);*/


$vwp_menu_items = array(
    array("key" => "conditions" , "label" => "Conditions" , "title" => "Conditions" , "type" => "settings" , "class" => "conditions" , "callback"=> vwpwcc_get_conditions()),
    array("key" => "description" , "label" => "Description" , "title" => "Description" , "type" => "dropdown" , "class" => "wcc-description", "callback"=> vwpwcc_get_description()),
    array("key" => "slug" , "label" => "Slug" , "title" => "Slug" , "type" => "dropdown" , "class" => "slug" ,  "callback"=> vwpwcc_get_slug()),
    array("key" => "shortcode" , "label" => "[/]" , "title" => "Shortcode" , "type" => "dropdown" , "class" => "shortcode", "callback"=> vwpwcc_get_shortcode())
    
);


function vwpwc_populate_menu(){
    global $vwp_menu_items;

    $vwp_menu = "";
    foreach($vwp_menu_items as $menu_item){
        $vwp_menu .= '<button class="vwp-menu-item '.$menu_item["key"].' '.$menu_item["type"].'" data-key="'.$menu_item["key"].'">'.$menu_item["label"].'</button>';
        //add_vwp_widget($menu_item["key"] , $menu_item["Shortcode"] , $menu_item["fields"]); 
    }


    //$vwp_menu_widgets = vwp_populate_menu_widgets($vwp_menu_items);


    return $vwp_menu;
}

//add_vwp_menu(
function vwpwc_populate_menu_widgets($widget_type){
    global $vwp_menu_items;
    $vwp_menu_widgets = "";
    foreach($vwp_menu_items as $widget_item){
        if($widget_item["type"] == $widget_type)
        $vwp_menu_widgets .= '<div class="vwp-menu-widget '.$widget_item["key"].' '.$widget_item["type"].'"><div class="vwp-widget-title">'.$widget_item["title"].'</div>'.$widget_item["callback"].'</div>';
    }

    return $vwp_menu_widgets;

}


function vwpwcc_get_description(){
    global $vwp_post_id;
    ob_start();
    ?>
    <textarea id="vwpwcc-collection-description" type="text" name="vwpwcc-collection-description"><?php echo @get_the_excerpt($vwp_post_id)  ?></textarea>  
    <hr class="vwp-divider" />
    <button class="vwp-button vwp-button-save-description">Done</button>

    <?php
    // get output
    $description = ob_get_contents();
    // clean buffer
    ob_end_clean();

    return $description;
}

function vwpwcc_get_slug(){
    global $vwp_post_id;
    ob_start();
    ?>
    <input type="text" id="vwpwcc-collection-slug" name="vwpwcc-collection-slug" value="<?php echo get_post_field('post_name', $vwp_post_id); ?>" />
    <hr class="vwp-divider" />
    <button class="vwp-button vwp-button-save-slug">Done</button>

    <?php
    // get output
    $description = ob_get_contents();
    // clean buffer
    ob_end_clean();

    return $description;
}


function vwpwcc_get_shortcode(){
    global $vwp_post_id;
    ob_start();
    ?>
    <div id="wc-shortcode" class="vwp-view-action vwp-form-row"><div id="vwpwccol-shortcode" data-id="<?php echo $vwp_post_id ?>">[collections id="<?php echo $vwp_post_id ?>"]</div></div>  
    <hr class="vwp-divider" />
    <button class="vwp-button vwp-button-copy-shortcode">Copy</button>
    <?php
    // get output
    $shortcode = ob_get_contents();
    // clean buffer
    ob_end_clean();

    return $shortcode;

}


function vwpwcc_get_conditions(){
    global $vwp_post_id;
    
    $collection_settings = get_post_meta( $vwp_post_id, "collection_settings" ,true);
    ob_start();
    ?>
    <div id="term-autosuggest-widget" class="autosuggest-widget"><div id="autosuggest-search-wrapper"><input type="text" id="term-autosuggest-input" placeholder="Search..." name="term-autosuggest-input" /></div><div id="term-autosuggest-list"></div></div>
    <div id="vwp-settings-wrapper">Match Products to:
        <div class="vwp-form-row label-inline"><input type="radio" id="all" name="condition-match" value="all" checked="checked" /><label class="vwpvf-label condition-match" for="all">All Conditions</label><input type="radio" id="any" name="condition-match" value="any" /><label class="vwpvf-label condition-match" for="any">Any Condition</label></div>
        <div class="vwpvf-repeatable-group"><!--span class="vwpwcc-loading">Loading conditions...</span--></div>
        <button id="vwpwccol-add-condition" class="vwp-btn">Add</button>
        <!--button id="vwpwccol-preview-products" class="vwp-btn">Preview</button-->
        <div><textarea id="vwpwccol-conditions-json" name="vwpwccol-conditions-json"><?php echo @$collection_settings ?></textarea></div>
        <input id="post-id" type="hidden" name="post_id" value="<?php echo @intval($vwp_post_id) ?>" />
    </div>
    <?php
    $conditions = ob_get_contents();
    // clean buffer
    ob_end_clean();
    
    
    return $conditions;
}


?>
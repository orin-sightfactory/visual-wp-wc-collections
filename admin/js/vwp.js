jQuery(document).ready( function() {

    window_h = jQuery(window).height()
    wpadminbar_h = jQuery("#wpadminbar").height()
    plugin_header_h = parseInt(jQuery(".vwp-plugin-header").css("height")) + (parseInt(jQuery(".vwp-plugin-header").css("padding-top")) * 2)
    plugin_titlebar_h = parseInt(jQuery(".vwp-plugin-page-title-bar").css("height")) + parseInt(jQuery(".vwp-plugin-page-title-bar").css("padding-top"))
    fixed_h = plugin_header_h + plugin_titlebar_h

    jQuery("#vwp-plugin-body").css("margin-top" , fixed_h)

    //jQuery(".vwp-menu-item.conditions.settings").click();
    vwp_toggle_settings('' , 'conditions');

    jQuery(".vwp_dialog_box_control.close").click(function(){
        vwp_toggle_dialog_box();
    })

    jQuery("#wpbody-content").on("click" , ".vwp_has_context_menu" , function(){
        context_ele = jQuery(this).find(".vwp_context_menu")
        toggle_context_menu(context_ele);
    })

    jQuery(".vwp-menu-item").click(function(){
        menu_key = jQuery(this).attr("data-key");
        if(jQuery(this).hasClass("dropdown")){
            toggle_menu_widget(this , menu_key);
        }else{
            vwp_toggle_settings(this , menu_key);
        }
    })
});

function toggle_menu_widget(ele , menu_key){
    if(jQuery(".vwp-menu-item."+menu_key).hasClass("active")){
        jQuery(".vwp-menu-item.dropdown").removeClass("active");
        jQuery("#vwp-menu-dropdown").removeClass("active");
    }else{
        jQuery(".vwp-menu-item.dropdown").removeClass("active");
        jQuery(".vwp-menu-item."+menu_key).addClass("active")
        ele_left = jQuery(ele).position().left;
        ele_top = jQuery(ele).position().top;
        jQuery("#vwp-menu-dropdown").css("left" , ele_left);
        jQuery("#vwp-menu-dropdown").css("top" , ele_top);
        jQuery("#vwp-menu-dropdown").addClass("active");
        jQuery(".vwp-menu-widget.dropdown").removeClass("active");
        jQuery(".vwp-menu-widget.dropdown."+menu_key).addClass("active");
    }   
}

function vwp_toggle_settings(ele , menu_key){
    if(jQuery(".vwp-menu-item."+menu_key).hasClass("active")){
        jQuery(".vwp-menu-item."+menu_key).removeClass("active");
        jQuery(".vwp-menu-widget."+menu_key).removeClass("active");
        //jQuery("#vwp-menu-dropdown").removeClass("active");
    }else{
        jQuery(".vwp-menu-item.settings").removeClass("active");
        jQuery(".vwp-menu-item.dropdown").removeClass("active");
        jQuery(".vwp-menu-item."+menu_key).addClass("active")
        //ele_left = jQuery(ele).position().left;
        //ele_top = jQuery(ele).position().top;
        //jQuery("#vwp-menu-dropdown").css("left" , ele_left);
        //jQuery("#vwp-menu-dropdown").css("top" , ele_top);
        //jQuery("#vwp-menu-dropdown").addClass("active");
        jQuery("#vwp-menu-dropdown").removeClass("active");
        jQuery(".vwp-menu-widget.settings").removeClass("active");
        jQuery(".vwp-menu-widget.settings."+menu_key).addClass("active");
    }   
}

function toggle_context_menu(ele){
    if(jQuery(ele).hasClass("vwp_active")){
        jQuery(ele).removeClass('vwp_active')
    }else{
        jQuery(ele).addClass('vwp_active')
    }
}

function vwp_toggle_dialog_box(title = '' , body = ''){
    if(jQuery("#vwp_dialog_box").hasClass('active')){
        jQuery("#vwp_dialog_box").removeClass('active')
        jQuery("#vwp_overlay").removeClass('active')
    }else{
        jQuery("#vwp_dialog_box").addClass('active')
        jQuery("#vwp_overlay").addClass('active')
        jQuery("#vwp_dialog_box_title").html(title)
        jQuery("#vwp_dialog_box_body").html(body)
    }
}

function toggle_vwp_arrow(ele){
    if(jQuery(ele).hasClass('up')){
        jQuery(ele).removeClass('up');
        jQuery(ele).addClass('down');
    }else{
        jQuery(ele).removeClass('down');
        jQuery(ele).addClass('up');
   }
}

function vwp_form_init(form_fields , saved_json , form_container){
    console.log("initializing")
    saved_json_obj = JSON.parse(saved_json);
    append_obj = form_fields;
    form_html = generate_form(form_fields);
    jQuery(form_container).html(form_html);

    reset_input_values();
}



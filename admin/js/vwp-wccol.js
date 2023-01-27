var source_options = ["Product Title" , "Product Category" , "Product Tag" , "Product Price"]
var operator_options = ["is equal to" , "is NOT equal to" , "contains" , "starts with" , "ends with", "is greater than" , "is less than"]
var operator_incompatibility = [
                            {source : "Product Title", incompatibility : ["is greater than", "is less than"]},
                            {source : "Product Category", incompatibility : ["is NOT equal to" , "contains" , "starts with" , "ends with", "is greater than", "is less than"]},
                            {source : "Product Tag", incompatibility : ["is NOT equal to" , "contains" , "starts with" , "ends with", "is greater than", "is less than"]},
                            {source : "Product Price", incompatibility : ["contains" , "starts with" , "ends with"]},
                        ]

var collection_json;
var posts_per_page = 20
var current_page = 1
var admin_reload = true;
var manual_reload = true;

jQuery(document).ready( function() {
    var post_id = jQuery("#post-id").val();
    //alert("sdfgsdfG");

    //jQuery("#collapse-button").click();

    // Add first condition row
    var collection_conditions
    var current_autosuggest
    var current_autosuggest_id


    //const OPEN_CLASS = 'active'
    //const menu = document.querySelector('#term-autosuggest-widget')
    //const menuBtn = menu.querySelector('.vwpcol-term')

    wpbody_w = jQuery("#wpbody").width()
    wpbody_h = jQuery("#wpbody").height()
    adminmenu_w = jQuery("#adminmenu").width()
    /*vwp_card_p = parseInt(jQuery(".vwp-card").css("padding-left")) * 2
    condition_card_w = (wpbody_w   * .6) - vwp_card_p
    preview_card_w = (wpbody_w   * .4) - vwp_card_p
    preview_card_h = window_h - fixed_h  - wpadminbar_h - vwp_card_p
    console.log("preview_card_h: "+preview_card_h)
    preview_card_l = condition_card_w + adminmenu_w
    jQuery(".vwp-card.conditions-pane").css("width" , condition_card_w)
    jQuery(".vwp-card.collection-preview").css("left" , preview_card_l + vwp_card_p)
    jQuery(".vwp-card.collection-preview").css("width" , preview_card_w)
    jQuery(".vwp-card").css("height" , preview_card_h)*/

    if(jQuery("#vwpwccol-conditions-json").val().length){
        collection_settings = JSON.parse(jQuery("#vwpwccol-conditions-json").val())
        //console.log("collection_settings:"+collection_settings)
        //console.log("match_condition:"+match_condition)
        collection_conditions = collection_settings.conditions
        collection_conditions.forEach((condition, index) => {
            //console.log("condition:"+condition)
            html = add_condition_row(condition)
            jQuery(".vwpvf-repeatable-group").append(html);  
        })
        match_condition = collection_settings.match
        jQuery('input[name=condition-match][value='+match_condition+']').attr('checked', true)
        jQuery(".vwpwcc-loading").css("display" , "none");
        //jQuery('input[name=condition-match]').change()
        //preview_collection();
    }else{
        html = add_condition_row();
        jQuery(".vwpvf-repeatable-group").append(html);  
        //preview_collection();
    }     


    jQuery(".vwpvf-repeatable-group").on("click" , ".remove-row-btn", function(){
        row_ref = jQuery(this).data("row_num")
        jQuery("#repeatable-set-"+row_ref).remove();
        preview_collection();
        //jQuery("#vwpwccol-preview-products").click()
    })

    jQuery(".vwpvf-repeatable-group").on("click" , ".vwpwcc-done-condition-editing", function(event){
        event.stopPropagation();
        row = jQuery(this).data("row_num");
        repeatable_set = "#repeatable-set-"+row;
        //jQuery(repeatable_set + ".vwpvf-repeatable-set.vwpwccol-conditions").click()
        vwp_toggle_repeatable(row, true);
        source = jQuery(repeatable_set + " .vwpcol-source").val();
        operator = jQuery(repeatable_set + " .vwpcol-operator").val();
        term = jQuery(repeatable_set + " .vwpcol-term").val();
        pretty_row = '<div class="vwpwcc-pretty-row"><span class="vwpwcc-pretty-source">'+source+'</span><span class="vwpwcc-pretty-operator">'+operator+'</span><span class="vwpwcc-pretty-term" data-row="'+row+'">'+term+'</span><!--span class="vwpwcc-condition-edit" data-row="'+row+'"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19.769 9.923l-12.642 12.639-7.127 1.438 1.438-7.128 12.641-12.64 5.69 5.691zm1.414-1.414l2.817-2.82-5.691-5.689-2.816 2.817 5.69 5.692z"></path></svg></span--></div>';
        jQuery(repeatable_set + " .vwpwcc-pretty-row").html(pretty_row);
        preview_collection();
    })

    


    jQuery("#vwpwccol-preview-products").click(function(){
        current_page = 1
        preview_collection();

    })


    jQuery("#vwpwcc-add-new").click(function(){
        add_new_collection();
    });

    jQuery(".vwpwcc-edit-title").click(function(){
        //jQuery("#col-title").attr("contenteditable" , "true");
        jQuery("#col-title").focus();
    });

    jQuery(".vwpwcc-edit-title").mouseover(function(){
        //jQuery("#col-title").attr("contenteditable" , "true");
        jQuery("#col-title").hover();
    });


    jQuery("#vwpwccol-save-collection").click(function(){
        //alert("Save");
        if(jQuery("#col-title").text().length > 0){
            post_title = jQuery("#col-title").text();

            collection_json = check_conditions();

            if(collection_json.length >= 40){

                jQuery("#vwpwccol-conditions-json").val(collection_json);
        
                // Create / Update Post
                post_id = parseInt(jQuery("#post-id").val());
                //!isNaN(jQuery("#post-id").val()) ? jQuery("#post-id").val() : 0;
                post_excerpt = jQuery("#col-description").val();
                post_status = 'publish'
                post_type = 'collection'
                if(post_id > 0){
                    post_args = {"ID":post_id,"post_title":post_title,"post_excerpt":post_excerpt,"post_status":post_status,"post_type":post_type}
                }else{
                    post_args = {"post_title":post_title,"post_excerpt":post_excerpt,"post_status":post_status,"post_type":post_type}
                }
               
                save_collection(post_args , collection_json);
                // Display Preview
                //get_collection_result_set_json(collection_json)
            }else{
                alert("Enter at least one condition for this collection.");
            }

        }else{
            alert("Enter a title for this collection.");
        }





        /*jQuery(".vwp-input").each(function (index , ele){
            sn_json += sn_json.length > 0 ? ',' : '';
            sn_json += '"'+jQuery(ele).attr("name")+'":"'+jQuery(ele).val()+'"';
        })
        console.log("sn_json: "+sn_json);
        jQuery("#sn-settings").val('{'+sn_json+'}');
        save_notice(jQuery("#sn-title").val() , sn_json)*/
    })

    jQuery("#vwpwccol-add-condition").click(function(){
        html = add_condition_row();
        jQuery(".vwpvf-repeatable-group").append(html);
    })


    jQuery(".vwpvf-repeatable-group").on("change", ".vwpcol-source", function(){
        source_val = jQuery(this).val();
        //console.log("source: "+source_val)
        if(source_val == "Product Category"){
            jQuery(this).parent().parent().find(".vwpwccol-condition-wrapper.term-wrapper").addClass("autosuggest expand")
            jQuery(this).parent().parent().find(".vwpcol-term").data("term_type" , "product_cat")
            jQuery(this).parent().parent().find(".vwpcol-term").addClass("autosuggest")
            jQuery(this).parent().parent().find(".vwpcol-term").val("")
           // jQuery(this).data("term_type").addClass("autosuggest")
            //jQuery(this).parents().find(".vwpvf-repeatable-set .vwpcol-term").after("suggest")
        }else if(source_val == "Product Tag"){
            jQuery(this).parent().parent().find(".vwpwccol-condition-wrapper.term-wrapper").addClass("autosuggest expand")
            jQuery(this).parent().parent().find(".vwpcol-term").data("term_type" , "product_tag")
            jQuery(this).parent().parent().find(".vwpcol-term").addClass("autosuggest")
            jQuery(this).parent().parent().find(".vwpcol-term").val("")
           // jQuery(this).data("term_type").addClass("autosuggest")
            //jQuery(this).parents().find(".vwpvf-repeatable-set .vwpcol-term").after("suggest")
        }else{
            jQuery(this).parents().find(".vwpvf-repeatable-set .vwpcol-term").data("term_type" , "")
            jQuery(this).parent().parent().find(".vwpwccol-condition-wrapper.term-wrapper").removeClass("autosuggest expand")
            jQuery(this).parent().parent().find(".vwpcol-term").data("term_type" , "title")
            jQuery(this).parent().parent().find(".vwpcol-term").removeClass("autosuggest")

        }

        do_option_incompatibility(this);

    })

    jQuery(".vwpvf-repeatable-group").on("change", ".vwpcol-operator", function(){
        if(jQuery(this).parent().parent().find(".vwpcol-term").val().length > 0){
            jQuery("#vwpwccol-preview-products").click()
        }
    })

    jQuery("input[name='condition-match']").change(function(){
        //jQuery("#vwpwccol-preview-products").click()
        preview_collection();
    })

    jQuery(".vwpvf-repeatable-group").on("click", ".vwpwccol-condition-wrapper.autosuggest", function(){
        //console.log("pseudo click")
        //document.removeEventListener("click", reset_autosuggest, true);
        //if(jQuery(this).hasClass("autosuggest")){
            plugin_body_margin_top = parseInt(jQuery("#vwp-plugin-body").css("margin-top"))
            //console.log("plugin_body_margin_top "+plugin_body_margin_top)
            plugin_page_title_bar_height = jQuery(".vwp-plugin-page-title-bar").height()
            //console.log("plugin_page_title_bar_height "+plugin_page_title_bar_height)
            plugin_header_height = jQuery("#vwp-header-wrapper").height();
            adminmenu_width = jQuery("#adminmenu").width()
            term_position = jQuery(this).offset()
            autosuggest_left = term_position.left - adminmenu_width
            autosuggest_top = term_position.top - plugin_header_height; // - plugin_body_margin_top - 1
            //console.log("plugin_page_title_bar_height "+plugin_page_title_bar_height)
            term_input_width = parseInt(jQuery(this).css("width"))
            //console.log("autosuggest_left: "+autosuggest_left)
            jQuery("#term-autosuggest-widget").css("top" , autosuggest_top)
            jQuery("#term-autosuggest-widget").css("left" , autosuggest_left)
            jQuery("#term-autosuggest-widget").css("width" , term_input_width)

            current_autosuggest_type = jQuery(this).find(".vwpcol-term").data("term_type")
            current_autosuggest_id = jQuery(this).attr("id")
            if(jQuery(this).hasClass("expand")){
                //console.log("has expand")
                set_autosuggest()
                //document.addEventListener("click", reset_autosuggest, true)
            }else{
                reset_autosuggest()
            }

       //}
    })

    jQuery(".vwp-submenu-tab").click(function(){
        tab_content = jQuery(this).data("tab")
        jQuery(".vwp-tab-content").removeClass("active")
        jQuery(".vwp-tab-content."+tab_content).addClass("active")
        jQuery(".vwp-submenu-tab").removeClass("active")
        jQuery(".vwp-submenu-tab."+tab_content).addClass("active")
    })

    jQuery(".vwpvf-repeatable-group").on("click", ".vwpvf-repeatable-set.vwpwccol-conditions", function(){
        //console.log("edit condition");
        row = jQuery(this).data("row");
        vwp_toggle_repeatable(row);
        ///console.log("row="+row);
        //jQuery(".vwpwcc-condition-form").css("display" , "none");
        //jQuery("#vwpwcc-condition-form-"+row).css("display" , "block");
    });

    function vwp_toggle_repeatable(row , override = false){
        //if(!jQuery(ele).hasClass("active") && override == true){
            console.log("repeat toggle, row="+row+" override ="+override);
            if(jQuery("#repeatable-set-"+row).hasClass("active") && override == true){
                jQuery("#repeatable-set-"+row).removeClass("active")
            }else{
                jQuery("#repeatable-set-"+row).addClass("active")
            }
        //}
    }

    function vwp_open_repeatable(){
        
    }

    jQuery("#term-autosuggest-input").keyup(function(){
        if(jQuery(this).val().length > 2){
            //console.log("current_autosuggest_type: "+current_autosuggest_type)
            if(current_autosuggest_type == "product_cat" || current_autosuggest_type == "product_tag"){
                //console.log("term:"+jQuery(this).val())
                jQuery("#term-autosuggest-list").data("term_input_id" , current_autosuggest_id)
                do_cat_autosuggest(jQuery(this).val() , jQuery(this).attr("id"));
            }else{
                jQuery("#term-autosuggest-list").html();
            }
        }

    })

    jQuery(document).click(function(event){
        //console.log("target class: "+event.target.className)
        //console.log("target id: "+event.target.id)
        exclude_target_ids = ["autosuggest-search-wrapper" , "term-autosuggest-input"]
        exclude_target_classes = ["vwpvf-field input vwpcol-term autosuggest" , "auto-option", "vwpwccol-condition-wrapper autosuggest expand" , "vwpwccol-condition-wrapper autosuggest collapse"]
        target_id = event.target.id
        target_class = event.target.className
        if(!exclude_target_ids.includes(target_id) && !exclude_target_classes.includes(target_class)){
            reset_autosuggest()
        }
    })

    jQuery("#term-autosuggest-list").on("click" , ".auto-option" , function(){
        //document.removeEventListener("click", reset_autosuggest, true);
        term_input_id = jQuery("#"+current_autosuggest_id).data("ref_id")
        //console.log("term_input_id: "+term_input_id)
        //console.log("term_id: "+jQuery(this).data("term_id"))
        jQuery("#"+term_input_id).data("term_id" , jQuery(this).data("term_id"))
        jQuery("#"+term_input_id).val(jQuery(this).text())
        //jQuery("#vwpwccol-preview-products").click()
        //jQuery("#term-autosuggest-widget").removeClass("active")
        reset_autosuggest()
    })


    /*jQuery(".collection-preview").on("click" , ".preview-nav.prev", function(){
        current_page--
        preview_collection()
    })

    jQuery(".collection-preview").on("click" , ".preview-nav.next", function(){
        current_page++
        preview_collection()
    })

    jQuery(".vwpvf-repeatable-group").on("blur" , ".vwpcol-term", function(){
        jQuery("#vwpwccol-preview-products").click()
    })*/

    jQuery(".vwp-button-save-description").click(function(){
        description = jQuery("#vwpwcc-collection-description").val();
        vwpwcc_update_collection_post('post_excerpt' , description);
        toggle_menu_widget('' , 'description');
    })

    function vwpwcc_update_collection_post(param , value){
        
        jQuery.ajax({
            dataType : "html",

            url: vwpwccol_admin_ajax.ajax_url,
            type: 'post',
            data: {
                action: 'vwpwcc_update_collection_post',
                param: param,
                value: value,
                post_id: post_id
            },
            success: function(response){
                //console.log("param saved");
                if(response > 0){
                  //  close_vwp_dropdown_widget("slug");
                }else{
                    alert("Error saving "+param);
                }
            }
        });
    }


    jQuery(".vwp-button-copy-shortcode").click(function(){
        //sc_id = jQuery(this)
        copy_shortcode();
        close_vwp_dropdown_widget("shortcode");
    });

    function close_vwp_dropdown_widget(key){
        jQuery("#vwp-menu-dropdown").removeClass("active");
        jQuery(".vwp-menu-item."+key).removeClass("active");
    }

    jQuery(".vwp-button-save-slug").click(function(){
        slug = jQuery("#vwpwcc-collection-slug").val();
        vwpwcc_update_collection_post('post_name' , slug);

        close_vwp_dropdown_widget("slug");
    });

    /*function save_slug(){
        
        // save post slug
        jQuery.ajax({
            url: vwpwccol_admin_ajax.ajax_url,
            dataType : "html",
            type: 'POST',
            data: {
                action: 'vwpwcc_save_slug',
                slug: slug,
                post_id: post_id
            },
            success: function(response){
                console.log("slug saved");
                if(response > 0){
                  //  close_vwp_dropdown_widget("slug");
                }else{
                    alert("Error saving slug");
                }
            }
        });
    }*/


    jQuery(".vwp-menu-item").click(function(){
        widget_key = jQuery(this).data('key');
        //console.log("widget_key: "+widget_key)
        jQuery(".vwp-dropdown-widget").css("display" , "none");
        jQuery(".vwp-dropdown-widget."+widget_key).css("display" , "block");
    });

    // check if iframe is loaded
    jQuery("#vwp-live-preview").load(function(){
        toggle_live_preview_loader();
    });






    /*jQuery("#term-autosuggest-widget").mouseout(function(){      
        jQuery(document).mouseup(function(){
            if(jQuery("#term-autosuggest-widget").hasClass("active")){
                reset_autosuggest()
            }
        })
        
    })*/

    /*const addOffClick = (e, cb) => {
        const offClick = (evt) => {
          if (e !== evt) {
            cb()
            document.removeEventListener('click', offClick)
          }
        }
        document.addEventListener('click', offClick)
      }
      
      const handleClick = (e) => {
        const toggleMenu = () => menu.classList.toggle(OPEN_CLASS)
        //if (propCheck.checked) e.stopPropagation()
        if (!menu.classList.contains(OPEN_CLASS)) {
          toggleMenu()
          addOffClick(e, toggleMenu)
        }
      }
      
      menuBtn.addEventListener('click', handleClick)*/
    function add_new_collection(){
        jQuery.ajax({
            type : "post",
            dataType : "html",
            url : vwpwccol_admin_ajax.ajax_url,
            data : {action: 'add_new_collection'},          
            success: function(response) {
                if(response.type == "success" || response.type == undefined) {      // ************** Refine
                    if(response > 0){
                        var fullurl = window.location.href;
                        var url = fullurl.split("?");                        
                        
                        location.href = url[0]+ "?page=vwp-wc-collections&view=edit&id="+response;
                    }else{
                        alert("Error Updating Draft from Add.")
                    }
                }else {
                    alert(response.type);
                    alert("ERROR: Could not update preview.");
                }
            }
        })
    }

    // alert when user tries to leave page
    /*jQuery(window).bind('beforeunload', function(){
        return 'You have unsaved changes. Are you sure you want to leave?';

    });*/

    
    function preview_collection(){
        collection_json = check_conditions();
        if(collection_json.length >= 40){
            //jQuery("#collection-preview-summary").html("")
            //jQuery("#collection-preview-list").html("refreshing list...")
            post_id = parseInt(jQuery("#post-id").val());
            
            update_collection_draft(post_id , 'collection_draft' , collection_json)
            //get_collection_result_set_json(collection_json)
        }else{
            alert("Enter at least one condition for this collection.");
        }
    }


    function set_autosuggest(){
        jQuery("#term-autosuggest-widget").addClass("active")
        jQuery("#"+current_autosuggest_id).removeClass("expand")
        jQuery("#"+current_autosuggest_id).addClass("collapse")
        jQuery("#term-autosuggest-input").focus()
        //document.addEventListener("click", reset_autosuggest, true)
    }
    
    function reset_autosuggest(){
        /*console.log("e: "+e)
        console.log("target = "+jQuery(e["target"]).attr("id"))
        for(var key in e) {
            var value = e[key];
            console.log(key+" = "+value)
        }*/
        if(jQuery("#term-autosuggest-widget").hasClass("active")){
            //console.log("auto is active")
            jQuery("#term-autosuggest-widget").removeClass("active")
            jQuery("#"+current_autosuggest_id).find(".vwpcol-term").blur()
            jQuery("#"+current_autosuggest_id).removeClass("collapse")
            jQuery("#"+current_autosuggest_id).addClass("expand")
        
            //jQuery("#term-autosuggest-widget").removeClass("active")
            jQuery("#term-autosuggest-input").val("")
            jQuery("#term-autosuggest-list").html("")
        }
    }
    
});

function toggle_live_preview_loader(){
    console.log("toggle_live_preview_loader")
    if(jQuery("#vwp-live-preview-loader").css("display") == "none"){
        jQuery("#vwp-live-preview-loader").css("display" , "block");
        //jQuery(".vwp-loader-text").css("animation" , "blink 1s infinite");
    }else{
        jQuery("#vwp-live-preview-loader").css("display" , "none");
    }
} 

function update_collection_draft(post_id , meta_key , meta_value){
    jQuery.ajax({
        type : "post",
        dataType : "html",
        url : vwpwccol_admin_ajax.ajax_url,
        data : {action: 'update_collection_draft' , post_id : post_id, meta_key : meta_key , meta_value : meta_value},          
        success: function(response) {
            if(response.type == "success" || response.type == undefined) {      // ************** Refine
                if(response == "updated"){
                    //document.getElementById('wc-collection-preview').contentWindow.location.reload();
                    //location.href = '/wp-admin/admin.php?page=vwp-wc-collections&view=edit&id='+response;
                    //collection_result_html = get_collection_result_html(false , post_id);
                    //alert(collection_result_html);
                    //setTimeout(jQuery('#vwp-live-preview')[0].contentWindow.location.reload(true) , 1000);
                    //preview_url = manual_reload ? '/collection/preview/?id='+post_id+'&draft=false' : '/collection/preview/?id='+post_id+'&draft=true';
                    toggle_live_preview_loader();
                
                    var site_url = vwpwccol_admin_ajax.site_url;
                    //alert(site_url);
                    preview_url = site_url+'/collection/vwpwcc-preview-collection/?id='+post_id+'&draft=true';
                    setTimeout(change_preview_url , 1000 , preview_url);
                    // change src of iframe

                    //setTimeout(jQuery('#vwp-live-preview')[0].contentWindow.location.assign(preview_url) , 1000);
                }else{
                    //alert("Error Updating Draft.");
                    //preview_url = '/collection/preview/?id='+post_id+'&draft=true';
                    //setTimeout(change_preview_url , 1000 , preview_url);
                    //setTimeout(jQuery('#vwp-live-preview')[0].contentWindow.location.reload(true) , 1000);
                }
            }else {
                alert(response.type);
                alert("ERROR: Could not update preview.");
            }
        }
    })
}

function change_preview_url(preview_url){
    jQuery("#vwp-live-preview").attr("src" , preview_url);
    //toggle_live_preview_loader();
}

function check_conditions(){
    collection_condition_match = jQuery("input[name='condition-match']:checked").val();
    var collection_json = '{"match":"'+collection_condition_match+'","conditions":[';
    var post_args = [];
    var has_multiple_conditions = false;
    jQuery(".vwpwccol-conditions").each(function (index , ele){
        conditions_json = "";
        jQuery(ele).find(".vwpvf-field").each(function (index , input){
            conditions_json += conditions_json.length > 0 ? ',' : '';
            if(jQuery(input).data("name") == "term"){
                conditions_json += '"'+jQuery(input).data("name")+'": {"text":"'+jQuery(input).val()+'","term_id":'+jQuery(input).data("term_id")+'}';
            }else{
                conditions_json += '"'+jQuery(input).data("name")+'":"'+jQuery(input).val()+'"';
            }
            
            this_term = jQuery(input).val();
        })
        if(this_term.length > 0){
            collection_json += has_multiple_conditions ? ',' : '';
            collection_json += "{"+conditions_json+"}"
            has_multiple_conditions = true;
        }

    })
    collection_json += "]}";
    
    return collection_json
}

/*function load_collection_rows(){
    collection_settings = jQuery("#vwpwccol-conditions-json").val()
    match_condition = collection_settings.match
    conditions = collection_settings.conditions
    //conditions.forEach((condition, index) => {

    //})
}*/

function save_collection(post_args , collection_json){
    //console.log("saving collection");
    jQuery.ajax({
        type : "post",
        dataType : "html",
        url : vwpwccol_admin_ajax.ajax_url,
        data : {action: 'save_collection' , post_args_obj : post_args , "collection_settings_json" : collection_json},          
        success: function(response) {
            //alert(response);
            //console.log("response.type: "+response.type)
            if(response.type == "success" || response.type == undefined) {      // ************** Refine
                if(!isNaN(response) && parseInt(response) > 0){ 
                    //alert(response);
                    // Preview Products
                    //get_collection_result_set_json(collection_json);
                    
                    //get url without query string
                    var fullurl = window.location.href;
                    var url = fullurl.split("?");
                    

                    location.href = url[0]+'?page=vwp-wc-collections&view=edit&id='+response;
                }else{
                    alert("Error Occurred while saving")
                }
            }else {
                alert(response.type);
                alert("ERROR: Could not get collection list.");
            }
        }
    });
}


/*function get_collection_result_html(frontend , post_id){
    //console.log("Getting set");
    jQuery.ajax({
        type : "post",
        dataType : "html",
        url : vwpwccol_admin_ajax.ajax_url,
        data : {action: 'get_collection' , frontend : frontend , post_id : post_id},          
        success: function(response) {
            //alert(response);
            //console.log("response.type: "+response.type)
            if(response.type == "success" || response.type == undefined) {      // ************** Refine
                alert(response);
                //alert(response);
                products_html = "";
                //var collection_obj = jQuery.parseJSON(response)
                
                //if(response.length > 0){
                    //summary_html = '<span class="collection-count">'+response.length+'</span> product(s) found.'
                    jQuery("#vwp-preview-pane").html(response);
                //}//else{
                    //summary_html = 'No products matching your conditions.'
                //}
                //jQuery("#collection-preview-summary").html(summary_html)

                
                
            }else {
                alert(response.type);
                alert("ERROR: Could not get collection list.");
            }
        }
    });
}*/

function get_collection_result_set_json(collection_json){
    //console.log("Getting set");
    jQuery.ajax({
        type : "post",
        dataType : "json",
        url : vwpwccol_admin_ajax.ajax_url,
        data : {action: 'get_collection_result_set' , collection_settings_json : collection_json , posts_per_page : posts_per_page , current_page : current_page},          
        success: function(response) {
            //alert(response);
            //console.log("response.type: "+response.type)
            if(response.type == "success" || response.type == undefined) {      // ************** Refine
                //alert(response.count);
                products_html = "";
                //var collection_obj = jQuery.parseJSON(response)
                if(response.count > 0){
                    num_pages = Math.ceil(response.count / posts_per_page)
                    summary_html = '<div><span class="collection-count">'+response.count+'</span> product(s) matched.'
                    preview_nav_prev = current_page > 1 ? '<span class="preview-nav prev"><</span>' : ''
                    preview_nav_next = current_page < num_pages ? '<span class="preview-nav next">></span>' : ''
                    //summary_html += num_pages > 1 ? '<div>'+current_page+' of '+num_pages+'</div>' : ''
                    summary_html += '<span id="collection-preview-pagination">'+preview_nav_prev+'<span>'+current_page+' of '+num_pages+'</span>'+preview_nav_next+'</span></div>'
                    response.results.forEach((element , index) => {
                    
                        if(element.product_id > 0){
                            product_num = index + 1 + ((current_page - 1) * posts_per_page)
                            products_html += '<a href="'+element.product_permalink+'" target="_blank"><div class="preview-item"><span>'+product_num+'. </span><div class="preview-img">'+element.produt_image+'</div><div class="preview-text"><div class="product-name">'+element.product_title+'</div><div class="product-price">'+element.product_price_html+'</div></div></div></a>';
                        }else{
                            summary_html = 'No products found matching the conditions.';
                        }
                    }) 
                    jQuery("#collection-preview-list").html(products_html);
                }else{
                    summary_html = 'No products matching your conditions.'
                }
                jQuery("#collection-preview-summary").html(summary_html)

                
                
            }else {
                alert(response.type);
                alert("ERROR: Could not get collection list.");
            }
        }
    });
}

function do_cat_autosuggest(cat_term , id){
    jQuery.ajax({
        type : "post",
        dataType : "json",
        url : vwpwccol_admin_ajax.ajax_url,
        data : {action: 'cat_autosuggest' , tax_type : current_autosuggest_type , cat_term : cat_term},          
        success: function(response) {
            //alert(response);
            //console.log("response.type: "+response.type)
            if(response.type == "success" || response.type == undefined) {      // ************** Refine
                //alert(response);
                html = "";
                //var collection_obj = jQuery.parseJSON(response)
                response.forEach((element , index) => {
                    //if(element.product_id > 0){
                    html += '<div class="auto-option" data-term_id="'+element.term_id+'">'+element.name+'</div>';
                    //}else{
                     //   html += '<div>No products found matching the conditions.</div>';
                    //}
                })
                jQuery("#term-autosuggest-list").data("id" , id);
                jQuery("#term-autosuggest-list").html(html);
            }else {
                alert(response.type);
                alert("ERROR: Could not get term list.");
            }
        }
    });
}


/*function save_notice(title , settings){
    jQuery.ajax({
        type : "post",
        dataType : "html",
        url : vwp_wcsn_admin_ajax.ajax_url,
        data : {action: 'vwp_wcsn_save_notice' , title : title , settings : 'asdfa'},          
        success: function(response) {
            if(response.type == "success" || response.type == undefined) {      // ************** Refine
                // Do something
            }else {
                alert(response.type);
                alert("ERROR: Could not get course list.");
                if(boo){

                }
            }
        }
    });
}*/


var condition_row = [{"type" : "select" , "key":"source" , "options" : source_options},
                        {"type" : "select" , "key":"operator" , "options" : operator_options},
                        {"type" : "text" , "key":"term"} 
                    ]

var row_count = 1;


function add_condition_row(condition = {"source" : "" , "operator" : "" , "term" : {"text":"" , "term_id":0}}){
    console.log("row_count: "+row_count);
    row_type = condition.source == "" ? "new" : "existing";
    row_html = "";
    pretty_conditions = "";
    condition_row.forEach((element , index) => {
        //console.log("element.key: "+element.key)
        if(element.key == "source"){
            row_html += '<div class="vwpwccol-condition-wrapper source" data-row="'+row_count+'"><select id="'+element.key+'-'+row_count+'" class="vwpvf-field select vwpcol-source" name="condition-'+element.key+'-'+row_count+'" data-name="'+element.key+'">'
            element.options.forEach((ele_option , index) => {
                //console.log("ele_option: "+ele_option)
                selected = ele_option == condition.source ? ' selected' : ''
                row_html += '<option '+selected+'>'+ele_option+'</option>'
            })
            row_html += '</select></div>';
            pretty_conditions += '<span class="vwpwcc-pretty-source">'+condition.source+'</span>';
        }else if(element.key == "operator"){
            row_html += '<div class="vwpwccol-condition-wrapper operator" data-row="'+row_count+'"><select id="'+element.key+'-'+row_count+'" class="vwpvf-field select vwpcol-operator" name="condition-'+element.key+'-'+row_count+'" data-name="'+element.key+'">'
            element.options.forEach((ele_option , index) => {
                selected = ele_option == condition.operator ? ' selected' : '';
                row_html += '<option '+selected+'>'+ele_option+'</option>';
            })
            row_html += '</select></div>';
            pretty_conditions += '<span class="vwpwcc-pretty-operator">'+condition.operator+'</span>';
        }else{
            input_value = condition.term.text;
            term_id = condition.term.term_id


            if(condition.source == "Product Category"){
                term_type = "product_cat"
                input_icon = "chevron-down"
                wrapper_class = " term-wrapper autosuggest expand"
                input_class = " autosuggest"
            }else if(condition.source == "Product Tag"){
                term_type = "product_tag"
                input_icon = "chevron-down"
                wrapper_class = " term-wrapper autosuggest expand"
                input_class = " autosuggest"
            }else{
                term_type = ""
                input_icon = ""
                wrapper_class = " term-wrapper"
                input_class = ""
            }
            
            //console.log("input_value: "+input_value)
            
            row_html += '<div id="term-wrapper-'+row_count+'" class="vwpwccol-condition-wrapper'+wrapper_class+'" data-row="'+row_count+'" data-ref_id="term-'+row_count+'"><input id="term-'+row_count+'" value="'+input_value+'" class="vwpvf-field input vwpcol-term'+input_class+'" data-term_type="'+term_type+'" data-term_id="'+term_id+'" type="text" name="condition-'+element.key+'-'+row_count+'" data-name="term" autocomplete="off" /></div>'
            pretty_conditions += '<span class="vwpwcc-pretty-term" data-row="'+row_count+'">'+input_value+'</span>';

        }
    });

    remove_row_html = '<button class="vwpwcc-done-condition-editing" data-row_num="'+row_count+'">Done</button><span class="remove-row-btn" data-row_num="'+row_count+'">remove</span>'
    
    active_class = row_type == "new" ? " active" : "";
    condition_row_html = '<li id="repeatable-set-'+row_count+'" class="vwpvf-repeatable-set vwpwccol-conditions'+active_class+'" data-row="'+row_count+'"><div class="vwpwcc-pretty-row"><!--span class="vwpwcc-condition-edit" data-row="'+row_count+'"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19.769 9.923l-12.642 12.639-7.127 1.438 1.438-7.128 12.641-12.64 5.69 5.691zm1.414-1.414l2.817-2.82-5.691-5.689-2.816 2.817 5.69 5.692z"/></svg></span-->'+pretty_conditions+'</div><div id="vwpwcc-condition-form-'+row_count+'" class="vwpwcc-condition-form label-above" data-row="'+row_count+'">'+row_html+remove_row_html+'</div></li>'
    row_count++;

    //condition_rows = [{'pretty': pretty_conditions , 'html':condition_row_html}]

    return condition_row_html;
}




function do_option_incompatibility(ele){
    //console.log("ele: "+ele)
    row = jQuery(ele).parent().data("row")
    source =  jQuery(ele).val()
    target_id = "#operator-"+row
    operator_incompatibility.forEach((condition , index) => {
        if(condition.source == source){
            jQuery(target_id+" option").each(function(i , e){
                jQuery(this).removeAttr("disabled")
                condition.incompatibility.forEach((incompatible , index) => {
                    if(incompatible == e.text){
                        jQuery(this).attr("disabled" , "disabled")
                        //var selectedAttr = jQuery(this).attr('selected');
                        //if (typeof selectedAttr !== 'undefined' && selectedAttr !== false) {
                            jQuery(this).removeAttr("selected")
                       // }

                    }
                })

            })
        }
    })
}

/*function do_option_incompatibility(ele){
    console.log("ele: "+ele)
    row = jQuery(ele).parent().data("row")
    source =  jQuery(ele).val()
    target_id = "#operator-"+row
    operator_incompatibility.forEach((condition , index) => {
        if(condition.source == source){
            condition.incompatibility.forEach((incompatible , index) => {
                //console.log("options"+jQuery(target_id))

                jQuery(target_id+" option").each(function(i , e){
                    
                    if(incompatible == e.text){
                        jQuery(this).attr("disabled" , "disabled")
                    }else{
                        console.log("attr-"+i+": "+jQuery(this).attr("disabled"))
                        
                    }
                    //console.log("incompatible: "+incompatible+" / "+"op_option: "+e.text)
                })
            })
        }
    })
}*/


/*function copy_shortcode(copy_text){
    var copyText = document.getElementById("col-shortcode");
  // Select the text field
  copyText.select();
  copyText.setSelectionRange(0, 99999); // For mobile devices
  navigator.clipboard.writeText(copyText.value);
}*/

function copy_shortcode(){
    var copyText = jQuery("#vwpwccol-shortcode").text();
    navigator.clipboard.writeText(copyText);
}
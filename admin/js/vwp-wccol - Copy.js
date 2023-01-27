jQuery(document).ready( function() {

    // Add first condition row
    var collection_conditions
    var current_autosuggest
    var current_autosuggest_id

    const OPEN_CLASS = 'active'
    const menu = document.querySelector('#term-autosuggest-widget')
    const menuBtn = menu.querySelector('.vwpcol-term')


    if(jQuery("#vwpwccol-conditions-json").val().length){
        collection_settings = JSON.parse(jQuery("#vwpwccol-conditions-json").val())
        //console.log("collection_settings:"+collection_settings)
        match_condition = collection_settings.match
        //console.log("match_condition:"+match_condition)
        collection_conditions = collection_settings.conditions
        collection_conditions.forEach((condition, index) => {
            //console.log("condition:"+condition)
            html = add_condition_row(condition)
            jQuery(".vwpvf-repeatable-group").append(html);  
        })
        preview_collection();
    }else{
        html = add_condition_row();
        jQuery(".vwpvf-repeatable-group").append(html);  
        preview_collection();
    }      


    jQuery(".vwpvf-repeatable-group").on("click" , ".remove-row-btn", function(){
        row_ref = jQuery(this).data("row_num")
        jQuery("#repeatable-set-"+row_ref).remove();
        preview_collection();
    })


    jQuery("#vwpwccol-preview-products").click(function(){
        preview_collection();

    })

    function preview_collection(){
        collection_json = check_conditions();
        if(collection_json.length >= 40){
            jQuery("#collection-preview-list").html("refreshing list...")
            get_collection_result_set_json(collection_json)
        }else{
            alert("Enter at least one condition for this collection.");
        }
    }



    jQuery("#vwpwccol-save-collection").click(function(){
        if(jQuery("#col-title").val().length > 0){
            post_title = jQuery("#col-title").val();

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
        console.log("source: "+source_val)
        if(source_val == "Product Category"){
            jQuery(this).parent().parent().find(".vwpcol-term").data("term_type" , "cat")
            jQuery(this).parent().parent().find(".vwpcol-term").addClass("autosuggest")
            jQuery(this).parent().parent().find("i").addClass("chevron-down")
           // jQuery(this).data("term_type").addClass("autosuggest")
            //jQuery(this).parents().find(".vwpvf-repeatable-set .vwpcol-term").after("suggest")
        }else{
            jQuery(this).parents().find(".vwpvf-repeatable-set .vwpcol-term").data("term_type" , "")
        }
    })

    jQuery(".vwpvf-repeatable-group").on("click", ".vwpcol-term", function(){
        console.log("pseudo click")
        document.removeEventListener("click", reset_autosuggest);
        if(jQuery(this).hasClass("autosuggest")){
            adminmenu_width = jQuery("#adminmenu").width()
            term_position = jQuery(this).parent().offset()
            autosuggest_left = term_position.left - adminmenu_width + 1
            autosuggest_top = term_position.top
            term_input_width = parseInt(jQuery(this).css("width"))
            console.log("autosuggest_left: "+autosuggest_left)
            jQuery("#term-autosuggest-widget").css("top" , autosuggest_top)
            jQuery("#term-autosuggest-widget").css("left" , autosuggest_left)
            jQuery("#term-autosuggest-widget").css("width" , term_input_width)

            current_autosuggest_type = jQuery(this).data("term_type")
            current_autosuggest_id = jQuery(this).attr("id")
            if(jQuery(this).parent().find(".input-icon").hasClass("chevron-down")){
                set_autosuggest()
                document.addEventListener("click", reset_autosuggest, true)
            }else{
                reset_autosuggest()
            }

        }
    })

    jQuery(".vwpvf-repeatable-group").on("click", ".input-icon", function(){
        vwpcol_term_id = jQuery(this).data("ref_id")
        jQuery("#"+vwpcol_term_id).click()
    })

    jQuery("#term-autosuggest-input").keyup(function(){
        if(jQuery(this).val().length > 2){
            if(current_autosuggest_type == "cat"){
                //console.log("term:"+jQuery(this).val())
                jQuery("#term-autosuggest-list").data("term_input_id" , current_autosuggest_id)
                do_cat_autosuggest(jQuery(this).val() , jQuery(this).attr("id"));
            }else{
                jQuery("#term-autosuggest-list").html();
            }
        }

    })

    /*jQuery("#term-autosuggest-input").click(function(){  
        document.removeEventListener("click", reset_autosuggest)
    })*/

    jQuery("#term-autosuggest-list").on("click" , ".auto-option" , function(){
        document.removeEventListener("click", reset_autosuggest);
        term_input_id = jQuery(this).parent().data("term_input_id")
        //console.log("term_input_id: "+term_input_id)
        //console.log("term_id: "+jQuery(this).data("term_id"))
        jQuery("#"+term_input_id).data("term_id" , jQuery(this).data("term_id"))
        jQuery("#"+term_input_id).val(jQuery(this).text())
        //jQuery("#term-autosuggest-widget").removeClass("active")
        reset_autosuggest()
    })

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




    function set_autosuggest(){
        jQuery("#term-autosuggest-widget").addClass("active")
        jQuery("#"+current_autosuggest_id).parent().find(".input-icon").removeClass("chevron-down")
        jQuery("#"+current_autosuggest_id).parent().find(".input-icon").addClass("chevron-up")
        jQuery("#term-autosuggest-input").focus()
    }
    
    function reset_autosuggest(e){
        console.log("e: "+e)
        console.log("target = "+jQuery(e["target"]).attr("id"))
        /*for(var key in e) {
            var value = e[key];
            console.log(key+" = "+value)
        }*/
        if(jQuery("#term-autosuggest-widget").hasClass("active")){
            jQuery("#term-autosuggest-widget").removeClass("active")
            jQuery("#"+current_autosuggest_id).parent().find(".input-icon").removeClass("chevron-up")
            jQuery("#"+current_autosuggest_id).parent().find(".input-icon").addClass("chevron-down")
        
            jQuery("#term-autosuggest-widget").removeClass("active")
            jQuery("#term-autosuggest-input").val("")
            jQuery("#term-autosuggest-list").html("")
        }
    }
    
});



function check_conditions(){
    collection_condition_match = jQuery("input[name='col-match']:checked").val();
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
                if(parseInt(response) > 0){
                    // Preview Products
                    //get_collection_result_set_json(collection_json);
                    //jQuery("#post-id").val(response);
                    location.href = '/wp-admin/admin.php?page=vwp-wc-collections&view=edit&id='+response;
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


function get_collection_result_set_json(collection_json){
    //console.log("Getting set");
    jQuery.ajax({
        type : "post",
        dataType : "json",
        url : vwpwccol_admin_ajax.ajax_url,
        data : {action: 'get_collection_result_set' , collection_settings_json : collection_json},          
        success: function(response) {
            //alert(response);
            //console.log("response.type: "+response.type)
            if(response.type == "success" || response.type == undefined) {      // ************** Refine
                //alert(response);
                html = "";
                //var collection_obj = jQuery.parseJSON(response)
                response.forEach((element , index) => {
                    if(element.product_id > 0){
                        html += '<div><span>'+(index+1)+'. </span>'+element.product_title+'</div>';
                    }else{
                        html += '<div>No products found matching the conditions.</div>';
                    }
                })
                jQuery("#collection-preview-list").html(html);
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
        data : {action: 'cat_autosuggest' , cat_term : cat_term},          
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


var condition_row = [{"type" : "select" , "key":"source" , "options" : ["Product Title" , "Product Category" , "Product Tag"]},
                        {"type" : "select" , "key":"operator" , "options" : ["is equal to" , "contains" , "starts with" , "end with"]},
                        {"type" : "text" , "key":"term"} 
                    ]

var row_count = 1;

function add_condition_row(condition = {"source" : "" , "operator" : "" , "term" : {"text":"" , "term_id":0}}){
    row_html = "";
    condition_row.forEach((element , index) => {
        //console.log("element.key: "+element.key)
        if(element.key == "source"){
            row_html += '<div class="vwpwccol-condition-wrapper"><select id="'+element.key+'-'+row_count+'" class="vwpvf-field select vwpcol-source" name="condition-'+element.key+'-'+row_count+'" data-name="'+element.key+'">'
            element.options.forEach((ele_option , index) => {
                //console.log("ele_option: "+ele_option)
                selected = ele_option == condition.source ? ' selected' : ''
                row_html += '<option '+selected+'>'+ele_option+'</option>'
            })
            row_html += '</select></div>'
        }else if(element.key == "operator"){
            row_html += '<div class="vwpwccol-condition-wrapper"><select id="'+element.key+'-'+row_count+'" class="vwpvf-field select vwpcol-condition" name="condition-'+element.key+'-'+row_count+'" data-name="'+element.key+'">'
            element.options.forEach((ele_option , index) => {
                selected = ele_option == condition.operator ? ' selected' : ''
                row_html += '<option '+selected+'>'+ele_option+'</option>'
            })
            row_html += '</select></div>'
        }else{
            input_value = condition.term.text;
            term_id = condition.term.term_id


            if(condition.source == "Product Category"){
                term_type = "cat"
                input_icon = "chevron-down"
                input_class = "autosuggest"
            }else{
                term_type = ""
                input_icon = ""
                input_class = ""
            }
            
            //console.log("input_value: "+input_value)
            
            row_html += '<div class="vwpwccol-condition-wrapper"><input id="term-'+row_count+'" value="'+input_value+'" class="vwpvf-field input vwpcol-term '+input_class+'" data-term_type="'+term_type+'" data-term_id="'+term_id+'" type="text" name="condition-'+element.key+'-'+row_count+'" data-name="term" /><i class="input-icon '+input_icon+'" data-ref_id="term-'+row_count+'"></i></div>'
            
        }
    });

    remove_row_html = '<span class="remove-row-btn" data-row_num="'+row_count+'">remove</span>'
    
    condition_row_html = '<div id="repeatable-set-'+row_count+'" class="vwpvf-repeatable-set vwpwccol-conditions"><div class="vwp-form-row label-above">'+row_html+remove_row_html+'</div></div>'
    row_count++;

    return condition_row_html;
}
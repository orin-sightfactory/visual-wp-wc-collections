jQuery(document).ready( function() {

    // Add first condition row
    html = add_condition_row();
    jQuery(".vwpvf-repeatable-group").append(html);




    jQuery("#vwpwccol-preview-products").click(function(){
        collection_json = check_conditions();
        if(collection_json.length >= 40){
            get_collection_result_set_json(collection_json)
        }else{
            alert("Enter at least one condition for this collection.");
        }

    })

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
            conditions_json += '"'+jQuery(input).data("name")+'":"'+jQuery(input).val()+'"';
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

function save_collection(post_args , collection_json){
    console.log("saving collection");
    jQuery.ajax({
        type : "post",
        dataType : "html",
        url : vwpwccol_admin_ajax.ajax_url,
        data : {action: 'save_collection' , post_args_obj : post_args , "collection_settings_json" : collection_json},          
        success: function(response) {
            //alert(response);
            console.log("response.type: "+response.type)
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
    console.log("Getting set");
    jQuery.ajax({
        type : "post",
        dataType : "json",
        url : vwpwccol_admin_ajax.ajax_url,
        data : {action: 'get_collection_result_set' , collection_settings_json : collection_json},          
        success: function(response) {
            //alert(response);
            console.log("response.type: "+response.type)
            if(response.type == "success" || response.type == undefined) {      // ************** Refine
                //alert(response);
                html = "";
                //var collection_obj = jQuery.parseJSON(response)
                response.forEach((element , index) => {
                    html += '<div><span>'+(index+1)+'. </span>'+element.product_title+'</div>';
                })
                jQuery("#collection-preview-list").html(html);
            }else {
                alert(response.type);
                alert("ERROR: Could not get collection list.");
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


var condition_row = [{"type" : "select" , "name":"source" , "options" : ["Product Title" , "Product Category" , "Product Tag"]},
                        {"type" : "select" , "name":"operator" , "options" : ["is equal to" , "contains" , "starts with" , "end with"]},
                        {"type" : "text" , "name":"term"} 
]

var row_count = 1;

function add_condition_row(){
    row_html = "";
    condition_row.forEach((element , index) => {
        if(element.type == "select"){
            row_html += '<select id="'+element.name+'-'+row_count+'" class="vwpvf-field select" name="condition-'+element.name+'-'+row_count+'" data-name="'+element.name+'">'
            element.options.forEach((element , index) => {
                row_html += '<option>'+element+'</option>'
            })
            row_html += '</select>'
        }else{
            row_html += '<input id="term-'+row_count+'" class="vwpvf-field input" type="text" name="condition-'+element.name+'-'+row_count+'" data-name="term"></input>'
        }
    });

    condition_row_html = '<div class="vwpvf-repeatable-set vwpwccol-conditions"><div class="vwp-form-row label-above">'+row_html+'</div></div>'
    row_count++;
    return condition_row_html;
}
<?php
//wordpress activation hook
function vwpcollection_onactivation() {
     //check if the default collection exists
    $collection = get_page_by_title('VWPWCC Preview', OBJECT, 'collection');
    if ($collection) {
        return true;
    }
    else {
        //create the default collection
        vwpcollection_create_default_collection();

    }
  
    flush_rewrite_rules();
}

//create default collection function
function vwpcollection_create_default_collection() {
    //create the default collection
    $collection = array(
        'post_title' => 'VWPWCC Preview',
        'post_content' => 'This is the default collection',
        'post_status' => 'publish',
        'post_author' => 1,
        'post_type' => 'collection'
    );
    $preview_collection = array(
        'post_title' => 'VWPWCC Preview Collection',
        'post_content' => 'This is the preview template for the default collection',
        'post_status' => 'publish',
        'post_author' => 1,
        'post_type' => 'collection'
    );
   
    
    
    //insert the post into the database
    if(wp_insert_post($collection)) {
        wp_insert_post($preview_collection);
        flush_rewrite_rules();
        return true;
    }
    else {
        return false;
    }
}

//wordpress deactivation hook
function vwpcollection_ondeactivation() {
    
}

//wordpress uninstall hook
function vwpcollection_onuninstall() {
    
}

//wordpress init hook
function vwpcollection_oninit() {
    //register the post type
    vwpcollection_register_post_type();
}

function vwpcollection_register_post_type() {
    //create new post type called collection

    if (post_type_exists('collection')) {
        return true;
    }
    else {
        register_post_type('collection', array(
            'labels' => array(
                'name' => __('Collections'),
                'singular_name' => __('Collection'),
                'add_new' => __('Add New'),
                'add_new_item' => __('Add New Collection'),
                'edit_item' => __('Edit Collection'),
                'new_item' => __('New Collection'),
                'view_item' => __('View Collection'),
                'search_items' => __('Search Collections'),
                'not_found' => __('No collections found'),
                'not_found_in_trash' => __('No collections found in Trash'),
                'parent_item_colon' => ''
            ),
            'public' => true,
            'publicly_queryable' => true,
            'show_ui' => true,
            'show_in_menu' => false,
            'query_var' => true,
            'rewrite' => true,
            'capability_type' => 'post',
            'has_archive' => true,
            'hierarchical' => false,
            'menu_position' => null,
            'supports' => array('title', 'editor', 'author', 'thumbnail')
        ));
        
       
    }
   



}
//add metabox to the collection post type


function vwpcollection_add_meta_fields() {
    //add meta fields to the collection post type
    // Limit meta box to certain post types
    $post_types = array('collection');
    if(in_array(get_post_type(), $post_types)) {
        add_meta_box('collection_settings', 'Settings', 'vwpcollection_get_collection_meta', 'collection', 'normal', 'high');
        add_meta_box('collection_draft', 'Draft', 'vwpcollection_get_collection_meta', 'collection', 'normal', 'high',);
    }
    
}

//get the collection meta
function vwpcollection_get_collection_meta($post,$args) {
    // Add an nonce field so we can check for it later.
    wp_nonce_field( 'vwpcollection_meta_custom_nonce_action', 'vwpcollection_meta_nonce' );
 
    // Use get_post_meta to retrieve an existing value from the database.
    $post_id = $post->ID;
    $value = get_post_meta($post_id, $args['id'], true);
    //print_r(get_post_meta($post_id , 'collection_settings' , true));
    //exit;
    // Display the form, using the current value.
    ?>
    <label for="vwpcollection_plugin_meta_box">
        <?php _e( '', 'textdomain' ); ?>
    </label>

    
    <textarea style="width:100%;min-height:200px;" type="textarea" class="form-control" name="<?php echo esc_attr($args['id']) ?>" ><?php echo esc_attr( $value ); ?></textarea> 
    <?php

}

//save the collection meta
function vwpcollection_save_collection_meta($post_id) {
    //if post id is empty or not a number return false
    if (empty($post_id) || !is_numeric($post_id)) {
        return false;
    }

    //verify nonce
    /*if (!wp_verify_nonce($_POST['vwpcollection_meta_nonce'], 'vwpcollection_meta_custom_nonce_action')) {
        return $post_id;
    }*/

    //check autosave
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return $post_id;
    }

    //check permissions
    if (isset($_POST['POST_TYPE']) && 'collection' == $_POST['post_type']) {
        if (!current_user_can('edit_page', $post_id)) {
            return $post_id;
        }
        elseif (!current_user_can('edit_post', $post_id)) {
            return $post_id;
        }
    }

    //save the meta data if post collection settings is set
    if(isset($_POST['collection_settings']) && isset($_POST['collection_draft'])) {
    
        $collection_meta = array(
            'collection_settings' => sanitize_text_field($_POST['collection_settings']),
            'collection_draft' => sanitize_text_field($_POST['collection_draft'])
        );

        foreach ($collection_meta as $key => $value) {
            if (get_post_meta($post_id, $key, false)) {
                update_post_meta($post_id, $key, sanitize_text_field($value));
            }
            else {
                add_post_meta($post_id, $key, sanitize_text_field($value));
            }

            if (!$value) {
                delete_post_meta(sanitize_text_field($post_id), $key);
            }
        }
    }
}

//activation hook
register_activation_hook( WC_COLLECTION_ACTIVATION_PATH_URL, 'vwpcollection_onactivation');

//register_activation_hook(WC_COLLECTIONS_PLUGIN_DIR_PATH, 'vwpcollection_onactivation');

//deactivation hook
register_deactivation_hook(WC_COLLECTION_ACTIVATION_PATH_URL, 'vwpcollection_ondeactivation');

//uninstall hook
register_uninstall_hook(WC_COLLECTION_ACTIVATION_PATH_URL, 'vwpcollection_onuninstall');

//init hook
add_action('init', 'vwpcollection_oninit');

//add meta box hook
add_action('add_meta_boxes', 'vwpcollection_add_meta_fields');
add_action('save_post', 'vwpcollection_save_collection_meta');
?>
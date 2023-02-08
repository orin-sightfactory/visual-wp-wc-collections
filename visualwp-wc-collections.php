<?php
/**
 *
 * @link              http://www.sightfactory.com
 * @since             1.0.0
 * @package           VWP WC Collections
 *
 * @wordpress-plugin
 * Plugin Name:       VWP eCommerce Collections
 * Plugin URI:        http://www.sightfactory.com/wordpress-plugins/vwp-ecommerce-collections
 * Description:       Create collections of similar products based on categories, tags, product name etc for your WooCommerce store
 * Version:           1.0.3
 * Author:            Sightfactory
 * Author URI:        http://www.sightfactory.com
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       vwpwccollections
 * Domain Path:       /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}


define('WC_COLLECTIONS_PLUGIN_DIR_PATH', trailingslashit(plugin_dir_path( __FILE__ )) );
define('WC_COLLECTION_ACTIVATION_PATH_URL', __FILE__);

//require collections class
require_once plugin_dir_path( __FILE__ ) . 'inc/class.collections.php';

global $post , $vwpwcc_post_id , $manual_reload;


$manual_reload = true;
add_filter( 'single_template', 'vwpwc_load_collections_template', 10, 1 );
function vwpwc_load_collections_template( $template ) {
    global $post , $manual_reload;
    
    // disable admin bar from showing up on collection preview
    if ( 'collection' === $post->post_type && $post->post_name == 'vwpwcc-preview-collection') {
        //check if user has editor role
        if ( current_user_can( 'editor' ) || current_user_can( 'administrator' ) ) {
            return WC_COLLECTIONS_PLUGIN_DIR_PATH . 'admin/utilities/collection-preview.php';
        }    
        else {
            wp_die('You do not have sufficient permissions to access this page.');
        }



        //$manual_reload = false;

    }elseif ( 'collection' === $post->post_type && locate_template( array('single-collection.php') ) !== $template ) {
        /*
        * This is an 'collection' post
        * AND a 'single ad template' is not found on
        * theme or child theme directories, so load it
        * from our plugin directory from inside a /templates folder.
        */

        return WC_COLLECTIONS_PLUGIN_DIR_PATH . 'templates/single-collection.php';
    }

    return $template;
}




add_action('admin_menu', 'vwpwccol_add_menu');
function vwpwccol_add_menu(){
    $plugin_icon = 'data:image/svg+xml;base64,' . base64_encode('<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="#9ca2a7" fill-rule="evenodd" clip-rule="evenodd"><path d="M24 17.981h-13l-7 5.02v-5.02h-4v-16.981h24v16.981zm-2-14.981h-20v12.981h4v3.125l4.357-3.125h11.643v-12.981zm-9 6.001v5h-2v-5h2zm-1-1.5c.69 0 1.25-.56 1.25-1.25s-.56-1.25-1.25-1.25-1.25.56-1.25 1.25.56 1.25 1.25 1.25z"/></svg>');
    add_menu_page( 'WC Collections',      // Page Title 
                    'WC Collections',            // Menu Title 
                    'list_users',              // Capabilites 
                    'vwp-wc-collections',        // Menu Slug  
                    'vwpwccol_init',                 // Function
                    $plugin_icon,               // Icon
                    50                          // Position
                );
}

add_action('admin_enqueue_scripts', 'vwpwccol_ui_theme_style');
function vwpwccol_ui_theme_style() {
    if(isset($_GET['page']) && $_GET['page'] == 'vwp-wc-collections'){
    //ini_set('display_errors', 1); ini_set('display_startup_errors', 1); error_reporting(E_ALL);


        wp_enqueue_style('vwp-css', plugins_url('/admin/css/vwp.css' , __FILE__), array());
        wp_enqueue_style('vwp-wccol-admin-css', plugins_url('/admin/css/vwp-wccol.css' , __FILE__), array());
        wp_enqueue_style('gf-sen','https://fonts.googleapis.com/css2?family=Sen:wght@400;700&display=swap');
        wp_enqueue_script('vwp-js', plugins_url('/admin/js/vwp.js' , __FILE__) , array());
        wp_enqueue_script('vwp-wccol-admin-js', plugins_url('/admin/js/vwp-wccol.js' , __FILE__) , array());
        wp_localize_script( 'vwp-wccol-admin-js', 'vwpwccol_admin_ajax', array( 'ajax_url' => admin_url('admin-ajax.php'),'site_url'=>get_option('siteurl') ) );
    }
}

function vwpwccol_init(){
    global $vwpwcc_post_id;
    /*if(@$_GET['view'] == "edit" && @$_GET['action'] == "new"){
        $postarr = array("post_title"=>"Untitled Collection", "post_type" => "collection");
        $vwpwcc_post_id = wp_insert_post($postarr);
    }else*/
    if(@$_GET['view'] == "edit" && isset($_GET['id']) && intval($_GET['id']) > 0){
        $vwpwcc_post_id = intval(esc_html($_GET['id']));
        
    }else{
        $vwpwcc_post_id = 0;
    }
   
    require(WC_COLLECTIONS_PLUGIN_DIR_PATH.'admin/includes/menus.php');




    global $vwpwc_get_edit_menu;

    $plugin_title = get_admin_page_title($vwpwcc_post_id);
    $vwp_header_menu = vwpwc_get_header_menu($vwpwcc_post_id);
    $vwpwc_get_edit_menu = vwpwc_get_edit_menu($vwpwcc_post_id);
    $vwpwc_get_panes = vwpwc_get_panes($vwpwcc_post_id); 

   
    ?>
    <div id="vwp-wrapper">
        <div id="vwp-header-wrapper">
            <div id="vwp-header">
                <div id="vwp-branding"><span class="plugin-creator">VisualWP</span><?php echo esc_html($plugin_title) ?></div>
                <div id="vwp-header-menu"><?php echo wp_kses($vwp_header_menu,vwpcollection_get_allowed_html()) ?></div>
            </div>
             
        </div>
        <div id="vwp-panes"><?php echo wp_kses($vwpwc_get_panes,vwpcollection_get_allowed_html()); //$vwpwc_get_panes;?></div> 
        <div id="vwp-plugin-overlay"></div>  
    </div>
    

    <?php
}

function vwpwc_get_header_menu($vwp_id){
    $home_url = get_home_url();
    switch(@$_REQUEST['view']){
        case "edit":
            $collection_title = get_the_title($vwp_id);
            $vwp_header_menu = '<div class="vwp-input-wrapper collection-title"><div contentEditable id="col-title" class="vwp-post-title">'.esc_html($collection_title).'</div><svg class="vwpwcc-edit-title" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19.769 9.923l-12.642 12.639-7.127 1.438 1.438-7.128 12.641-12.64 5.69 5.691zm1.414-1.414l2.817-2.82-5.691-5.689-2.816 2.817 5.69 5.692z"></path></svg></div><button class="active" id="vwpwccol-save-collection">Save</button>';
            //$vwp_header_menu .= '<button>Go Pro</button>';
            $vwp_header_menu .= '<button id="vwpwcc-add-new"><span class="vwp-pseudo-icon">+</span>Add New</button>';
            break;
        default:
            $collection_title = get_the_title($vwp_id);
            $vwp_header_menu = '';
            //$vwp_header_menu .= '<button>Go Pro</button>';
            $vwp_header_menu .= '<button class=""><a href="'.$home_url.'/wp-admin/admin.php?page=vwp-wc-collections&view=edit&action=new">+Add New</a></button>';
            break;
    }

    return wp_kses($vwp_header_menu,vwpcollection_get_allowed_html());
}


function vwpwc_get_edit_menu($vwp_id){
    global $vwp_menu_items;
    switch(@$_REQUEST['view']){
        case "edit":
            $vwp_edit_menu = '<div id="vwp-menu-primary">'.vwpwc_populate_menu().'</div>';

            break;
        default:
            $vwp_edit_menu = '';
            break;
    }

    return wp_kses($vwp_edit_menu,vwpcollection_get_allowed_html());
}

function vwpwc_get_panes($vwp_id){
    global $vwpwc_get_edit_menu;
    switch(@$_REQUEST['view']){
        case "edit":
            ob_start();
            ?>
            <div id="vwp-settings-pane">
                <?php
                echo wp_kses(vwpwc_populate_menu_widgets('settings'),vwpcollection_get_allowed_html()); 
                ?>               
            </div>
            <div id="vwp-visual-pane">
                <div id="vwp-menu"><?php echo wp_kses($vwpwc_get_edit_menu,vwpcollection_get_allowed_html()); ?></div>
                <div id="vwp-menu-dropdown"><?php echo wp_kses(vwpwc_populate_menu_widgets('dropdown'),vwpcollection_get_allowed_html()) ?></div>
                <div id="vwp-preview-pane"><div id="vwp-live-preview-loader"><div class="vwp-loader-text">Loading...</div></div><iframe id="vwp-live-preview" src="<?php echo esc_html(get_home_url())?>/collection/vwpwcc-preview-collection/?id=<?php echo esc_html(@intval($vwp_id)) ?>"></iframe></div>
            </div>
            
            <?php
            $vwp_panes = ob_get_contents();
            ob_end_clean();
            break;
        default:
            ob_start();
            ?>
            <div id="vwp-list-pane">
                <?php echo wp_kses(vwpwccol_list(),vwpcollection_get_allowed_html()); ?>
            </div>

            <?php
            $vwp_panes = ob_get_contents();
            ob_end_clean();                
            break;
    }



    return wp_kses($vwp_panes,vwpcollection_get_allowed_html());
}

function vwpwccol_list(){
    //global $wpdb;
   
    $ob_output = "List";
    // The Query
    $args = array("post_type" => "collection");
    $the_query = new WP_Query( $args );
     
    // The Loop
    if ( $the_query->have_posts() ) {

    ob_start();
    ?>
    <div id="collection-list" class="vwp-card">
        <div id="vwpwccol-con">
            <div class="collection-th">
                <div class="vwp-th title">Title</div>
                <div class="vwp-th description">Description</div>
                <div class="vwp-th author">Author</div>
                <div class="vwp-th date">Last Modified</div>
            </div>
    <?php

        while ( $the_query->have_posts() ) {
            $the_query->the_post();
            $col_id = get_the_ID();
            if(get_the_title() != "VWPWCC Preview Collection" ) {
            ?>
            <div class="collection-row">
                <div class="vwp-grid-col"><a href="<?php echo vwpwc_get_vwpwccol_view(array("view"=>"edit" , "id"=>get_the_ID())) ?>"><?php echo esc_html(get_the_title()) ?></a></div>
                <div class="vwp-grid-col"><?php echo esc_html(get_the_excerpt())  ?></div>
                <div class="vwp-grid-col"><?php echo esc_html(get_the_author())  ?></div>
                <div class="vwp-grid-col"><?php echo esc_html(get_the_modified_date())  ?></div>
            </div>
            <?php
            }
        }
        ?>
        </div>
        </div>
        <?php
        /* Restore original Post Data */
        wp_reset_postdata();  
        $ob_output = ob_get_contents();
        ob_end_clean();

    } else {
        // no posts found
    }
 



 
    return $ob_output;
}


function vwpwc_get_vwpwccol_view($url_params = false){
    $query_str = '';
    foreach($url_params as $url_param_key => $url_param_value){
        //$query_string .= strlen($query_string) > 0 ? '&$url_param
        $query_str .= '&'.$url_param_key.'='.$url_param_value;
    }
    
    // fixes the issue with the admin url not being correct
    $vwp_view_url = get_admin_url().'admin.php?page='.esc_html($_GET['page']).esc_html($query_str); 
    
    
    return esc_html($vwp_view_url);
}




add_action('wp_ajax_vwpwc_get_collection_result_set' , 'vwpwc_get_collection_result_set');
function vwpwc_get_collection_result_set($frontend = false , $id = 0){
    global $wpdb, $post;
    $db_table_prefix = $wpdb->prefix;

    
    if($frontend){
        $current_page = 1;
        $posts_per_page = 12;
        $offset = ($current_page - 1) * $posts_per_page;
        
    }else{
        //added another conditional to prevent throwing error when the ajax is called from preview
        if(isset($_POST['current_page']) && isset($_POST['posts_per_page'])){
            $current_page = intval($_POST['current_page']);
            $posts_per_page = intval($_POST['posts_per_page']);        
            
        }
        else {
            $current_page = 1;
            $posts_per_page = 12;
        }
        $offset = ($current_page - 1) * $posts_per_page;
    }

    $collection_query_select = "SELECT ID FROM ".$wpdb->prefix."posts";
    $collection_where_default = " WHERE post_type = 'product'
                        AND post_status = 'publish'
                        AND (";

    $group_clause = " GROUP BY ID "; 
    $order_clause =  " ORDER BY post_title ASC ";
    $limit_clause = " LIMIT $offset , $posts_per_page";


    $source_field_map = array("Product Title"=>"post_title",
                            "Short Description" => "post_excerpt",
                            "Long Description" => "post_content",
                            "Product Category" => "product_cat",
                            "Product Tag" => "product_tag",
                            );

    $operator_mysql_map = array("contains"=>"LIKE",
                                "is equal to"=> "=",
                                "is NOT equal to"=> "<>",
                                "starts with"=>"LIKE",
                                "ends with"=>"LIKE",
                                "is less than"=>"<",
                                "is greater than"=>">",
                            );

    
    $collection_id = $id > 0 ? $id : $post->ID;
                            
    if(isset($_GET['id']) && is_numeric($_GET['id'])){
        $collection_id = sanitize_text_field(intval($_GET['id']));
    }
    
    else if(isset($_GET['id']) && !is_numeric($_GET['id'])){
        return false;
    }
                            

    $collection_settings_json = $frontend ? stripslashes(get_post_meta($collection_id,'collection_settings',true)) : stripslashes(get_post_meta($collection_id,'collection_draft',true));
    if($collection_settings_json == ''){
        $result_ids = 0;
        return $result_ids;
        exit;
    }
    
    //$collection_settings_json = stripslashes(get_field('collection_settings' , $collection_id));


    //$collection_settings_json = stripslashes($_POST['collection_settings_json']);
    $collection_settings = json_decode($collection_settings_json, true);
    //var_dump($collection_settings['conditions']);
    $where_match = $collection_settings['match'] == 'any' ? " OR " : " AND ";
    $collection_where = "";
    $has_cat_search = false; 

    $where_col_tax = '';
    $where_col_tax_in = '';
    $term_ids = array();
    $price_inner_join = "";
    $price_where = "";
    foreach($collection_settings['conditions'] as $condition){
        //var_dump($condition);
        //echo "<br><br>";
        $source = $condition['source'];
        $operator = $condition['operator'];		
        $term = $condition['term']['text'];
        $term_id = $condition['term']['term_id'];

        //$collection_where .= $collection_where == "" ? "" : $where_match;



        // Set Term based on Operator
        switch($operator){
            case "contains":
                $term_formatted = "%$term%";
                break;
            case "starts with":
                $term_formatted = "$term%";
                break;
            case "ends with":
                $term_formatted = "%$term";
                break;
            default:
                $term_formatted = $term;
                break;
        }


        if($source == 'Product Category' || $source == 'Product Tag'){
            $has_cat_search = true;
            $cat_term_ids[] = intval($term_id) ? intval($term_id) : 0;
           


                                                    
        }elseif($source == 'Product Price'){
            $price_inner_join = " INNER JOIN ".$db_table_prefix."postmeta ON (".$db_table_prefix."posts.ID = ".$db_table_prefix."postmeta.post_id) ";
            $collection_where .= strlen($collection_where) > 0 ? $where_match : "";
            $collection_where .= ' meta_key = "_regular_price" AND meta_value '.$operator_mysql_map[$operator].' '.$term_formatted.' ';
        }else{
            $collection_where .= strlen($collection_where) > 0 ? $where_match : "";
            $collection_where .= $wpdb->prepare($source_field_map[$source]." ".$operator_mysql_map[$operator]." %s", $term_formatted);
        }

    }

    if($has_cat_search){
        $collection_where .= strlen($collection_where) > 0 ? $where_match : "";

  
            $collection_where .=   $db_table_prefix.'term_relationships.term_taxonomy_id IN ('.implode("," , $cat_term_ids).')';
      
    }




    $collection_where .= ")";

    $tax_inner_join = $has_cat_search ? " INNER JOIN ".$db_table_prefix."term_relationships ON (".$db_table_prefix."posts.ID = {$wpdb->prefix}term_relationships.object_id) " : "";

    $having_clause = $has_cat_search && trim($where_match) == "AND"  ? " HAVING COUNT(DISTINCT term_taxonomy_id) = ".count($cat_term_ids)." " : "";


    $collection_query_all = $collection_query_select.$price_inner_join.$tax_inner_join.$collection_where_default.$collection_where.$group_clause.$having_clause.$order_clause;

    $collection_query = $collection_query_select.$price_inner_join.$tax_inner_join.$collection_where_default.$collection_where.$group_clause.$having_clause.$order_clause.$limit_clause;



    $result_limitless = $wpdb->get_results($collection_query_all);
    $result_count = count($result_limitless);

    $results = $wpdb->get_results($collection_query);



    $result_set = array();
    $result_ids = array();
    if(count($result_limitless) > 0){
        $found_ids = array();
        foreach($result_limitless as $result){
            $product = wc_get_product( $result->ID );

            $product_link = get_permalink( $product->get_id() );
            $product_img = $product->get_image();
            

            $result_ids[] = $result->ID;
            $result_set[] = array("product_id" => $result->ID,
                                    "product_title" => $product->get_title(),
                                    "product_price_html" => $product->get_price_html(),
                                    "produt_image" =>  $product_img,
                                    "product_permalink" => $product_link                        
                            );

                
        //}
            //$found_ids[] = $result->ID;
        }
    }else{
      
        $result_ids = 0;
    }

    
    return $result_ids;

    //do_shortcode('[products ids="23294,23288,23284"]');

}

add_action('wp_ajax_save_collection' , 'vwpwcc_save_collection');
function vwpwcc_save_collection(){
    if ( current_user_can( 'editor' ) || current_user_can( 'administrator' ) ) {
    
   
        foreach($_POST as $key=>$value){
            $$key = $value;
        }

        $collection_settings_json = stripslashes($collection_settings_json);

        if(array_key_exists("ID" , $post_args_obj)){
            $post_id = wp_update_post( $post_args_obj );
        }else{
            $post_id = wp_insert_post( $post_args_obj );
        } 
        if(intval($post_id) > 0){
            // add metas
            update_post_meta($post_id , 'collection_settings' , sanitize_text_field($collection_settings_json));

            echo esc_html(intval($post_id));
        }else{
            echo "0";
        }

        exit;
    }
    else {
        echo "0";
        exit;
    }
}

add_action('wp_ajax_cat_autosuggest' , 'vwpwc_cat_autosuggest');
function vwpwc_cat_autosuggest(){
    global $wpdb;

    foreach($_POST as $key=>$value){
        $$key = $value;
    }

    $query = $wpdb->prepare("SELECT  {$wpdb->prefix}terms.name, {$wpdb->prefix}terms.term_id FROM {$wpdb->prefix}terms
    INNER JOIN {$wpdb->prefix}term_taxonomy ON ({$wpdb->prefix}terms.term_id = {$wpdb->prefix}term_taxonomy.term_id)
    WHERE {$wpdb->prefix}term_taxonomy.taxonomy = %s
    AND {$wpdb->prefix}terms.name LIKE %s", $tax_type , '%'.$wpdb->esc_like($cat_term).'%');



    $results = $wpdb->get_results($query);

    if($results){
        $cats = array();
        foreach($results as $result){
            $cats[] = array("name"=>$result->name , "term_id"=>$result->term_id);
        }

        echo json_encode($cats);
    }

    exit;
}

add_action('wp_ajax_update_collection_draft' , 'vwpwc_update_collection_draft');
function vwpwc_update_collection_draft(){
    foreach($_POST as $key=>$value){
        $$key = $value;
    }
    $update_success = update_post_meta(sanitize_text_field($post_id), sanitize_text_field($meta_key), sanitize_text_field($meta_value));
    $success_msg = $update_success ? "updated" : "failed";

    echo esc_html($success_msg);
    exit;

}

add_action('wp_ajax_get_collection' , 'vwpwc_get_collection');
function vwpwc_get_collection($is_frontend = true , $id = 0){
    global $post;
    
    if(isset($_POST['post_id'])){
        $collection = intval(sanitize_text_field($_POST['post_id'])) > 0 ? get_post(intval(sanitize_text_field($_POST['post_id']))) : $post;
        $is_frontend = false;
        
    }else{
        $collection = $id > 0 ? get_post(sanitize_text_field(intval($id))) : $post;
    }
    
    if(is_numeric($collection) && $collection == 0 || $collection == NULL) {
        return false;
    }
   
    $htmldata = '';
    if(isset($collection->post_title)) {
        $htmldata .= '<h2>'.esc_html($collection->post_title).'</h2>';
    }
    if(isset($collection->post_excerpt)) {
        $htmldata .= '<p>'.esc_html($collection->post_excerpt).'</p>';
    }
    
    $ids = vwpwc_get_collection_result_set($is_frontend , $collection->ID);
   
    if($ids){
        $product_ids = esc_html(implode("," , $ids ));
        return $htmldata.do_shortcode("[products ids='$product_ids' limit ='12' paginate='true']");
    }else{
        return false;
        
    }
}

add_shortcode("collections" , "vwpwccol_collections");
function vwpwccol_collections($atts){
    $id = $atts["id"];
    $results = vwpwc_get_collection(true , $id);
    if(!$results){
        $results = "<p>No products found.</p>";
    }
    return $results;
}


add_action('wp_ajax_add_new_collection' , 'vwpwcc_add_new_collection');
function vwpwcc_add_new_collection(){
    $postarr = array("post_title"=>"Untitled Collection", "post_type" => "collection");
    $insert_result = wp_insert_post($postarr);

    echo esc_html($insert_result);
    exit;
}


$vwpwwc_menu_description = '<div class="vwp-form-row label-above"><label class="vwpvf-label" for="vwpwcc-collection-description">Description</label><textarea id="vwpwcc-collection-description" type="text" name="vwpwcc-collection-description"><?php echo esc_html(@get_the_excerpt($vwpwcc_post_id))  ?></textarea></div>  
<hr class="vwp-divider" />';


add_action('wp_ajax_vwpwcc_update_collection_post' , 'vwpwcc_update_collection_post');
function vwpwcc_update_collection_post(){
    $param = sanitize_text_field($_POST["param"]);
    $value = sanitize_text_field($_POST["value"]);
    $post_id = sanitize_text_field(intval($_POST["post_id"]));
    $postarr = array("ID" => $post_id, $param => $value);
    $update_result = wp_update_post($postarr);

    echo esc_html($update_result);
    exit;
}





?>

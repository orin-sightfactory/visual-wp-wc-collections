<?php
/**
 * The template for displaying Collections in Admin
 *
 */

?>
<html><head>
<?php
if(isset($_GET["id"]) && $_GET["id"] > 0){
    do_action( 'wp_head');
    ?>
    </head><body>
    <?php
    $id = sanitize_text_field(intval($_GET["id"]));
    $use_saved = isset($_GET['draft']) && $_GET['draft'] == true ? false : true;
    $collection = vwpwc_get_collection($use_saved , $id);
    if($collection) {
        echo wp_kses($collection,vwpwc_allowed_html());
    }
    else {
        echo "<h2>No Products Found.</h2>";
    }
    ?>
    </body></html>
<?php
}else{
    echo "<h2>Error Displaying Preview.</h2>";
}


function vwpwc_allowed_html() {

	$allowed_tags = array(
		'a' => array(
			'class' => array(),
			'href'  => array(),
			'rel'   => array(),
			'title' => array(),
		),
		'abbr' => array(
			'title' => array(),
		),
		'b' => array(),
		'blockquote' => array(
			'cite'  => array(),
		),
		'cite' => array(
			'title' => array(),
		),
		'code' => array(),
		'del' => array(
			'datetime' => array(),
			'title' => array(),
		),
		'dd' => array(),
		'div' => array(
			'class' => array(),
			'title' => array(),
			'style' => array(),
		),
		'dl' => array(),
		'dt' => array(),
		'em' => array(),
		'h1' => array(),
		'h2' => array(),
		'h3' => array(),
		'h4' => array(),
		'h5' => array(),
		'h6' => array(),
		'i' => array(),
		'img' => array(
			'alt'    => array(),
			'class'  => array(),
			'height' => array(),
			'src'    => array(),
			'width'  => array(),
		),
		'li' => array(
			'class' => array(),
		),
		'ol' => array(
			'class' => array(),
		),
        'form'=> array(
            'action' => array(),
            'method' => array(),
            'class'  => array(),
            'id'     => array(),
            'name'   => array(),
            'value'  => array(),
            'type'   => array(),
        ),
        'option' => array(
            'selected' => array(),
        ),
		'p' => array(
			'class' => array(),
		),
		'q' => array(
			'cite' => array(),
			'title' => array(),
		),
        'select' => array(
            'class'  => array(),
            'id'     => array(),
            'name'   => array(),
            'value'  => array(),
            'type'   => array(),
        ),


		'span' => array(
			'class' => array(),
			'title' => array(),
			'style' => array(),
		),
		'strike' => array(),
        'svg'=> array(),
		'strong' => array(),
		'ul' => array(
			'class' => array(),
		),
	);
	
	return $allowed_tags;
}

<?php
/**
 * Plugin Name: Warranty System
 * Description: Secure warranty validation, autofill & language toggle for Contact Form 7
 * Version: 2.0
 * Author: Haier
 */

if (!defined('ABSPATH')) exit; // Exit if accessed directly

/* =====================================
   LOAD CSS & JS
===================================== */
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style(
        'haier-warranty-style',
        plugin_dir_url(__FILE__) . 'test-warranty.css'
    );

    wp_enqueue_script(
        'haier-warranty-script',
        plugin_dir_url(__FILE__) . 'test-warranty.js',
        array(),
        null,
        true
    );
});

/* =====================================
   CF7 SERVER-SIDE VALIDATION
===================================== */
add_filter('wpcf7_validate_text*', 'haier_validate_warranty', 20, 2);
add_filter('wpcf7_validate_text', 'haier_validate_warranty', 20, 2);

function haier_validate_warranty($result, $tag) {
    // Only validate the 'serial-number' field
    if ($tag->name !== 'serial-number') {
        return $result;
    }

    $serial = trim($_POST['serial-number'] ?? '');

    /* ===== WARRANTY DATA ===== */
    $warranty_data = array(
        '123456' => array(
            'brand'     => 'test',
            'model'     => 'test1234',
            'issueDate' => '2025-10-02'
        ),
    );

    /* ===== VALIDATION ===== */
    if (!isset($warranty_data[$serial])) {
        $result->invalidate($tag, '❌ Invalid warranty number.');
        return $result;
    }

    $data = $warranty_data[$serial];
    $purchase = new DateTime($data['issueDate']);
    $today = new DateTime();

    // Check if warranty expired
    if ($today > (clone $purchase)->modify('+1 year')) {
        $result->invalidate($tag, '❌ Warranty has expired.');
        return $result;
    }

    // Check if registration period (3 months) passed
    if ($today > (clone $purchase)->modify('+3 months')) {
        $result->invalidate($tag, '❌ Registration period has passed.');
        return $result;
    }

    /* ===== SECURE AUTOFILL ===== */
    $_POST['brand']        = $data['brand'];
    $_POST['model-number'] = $data['model'];

    return $result;
}

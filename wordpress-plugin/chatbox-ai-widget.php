<?php
/**
 * Plugin Name: ChatBox AI Widget
 * Plugin URI: https://chatbox-ai.com
 * Description: Connect custom-trained AI chatbots powered by ChatBox AI (Claude) to your WordPress website instantly.
 * Version: 1.2.0
 * Author: ChatBox AI Team
 * License: GPL2
 */

if (!defined('ABSPATH')) exit;

class ChatBox_AI_Widget_Plugin {
    public function __construct() {
        add_action('admin_menu', array($this, 'add_plugin_page'));
        add_action('admin_init', array($this, 'page_init'));
        add_action('wp_footer', array($this, 'render_widget'));
        add_action('admin_footer', array($this, 'render_admin_widget'));
    }

    public function add_plugin_page() {
        add_menu_page(
            'ChatBox AI Settings', 
            'ChatBox AI', 
            'manage_options', 
            'chatbox-ai-settings', 
            array($this, 'create_admin_page'),
            'dashicons-format-chat',
            100
        );
    }

    public function create_admin_page() {
        ?>
        <div class="wrap">
            <h1>🤖 ChatBox AI Widget Configuration</h1>
            <p>Connect your WordPress website to your custom-trained ChatBox AI assistant using your Agent ID.</p>
            <form method="post" action="options.php">
                <?php
                settings_fields('chatbox_ai_option_group');
                do_settings_sections('chatbox-ai-settings-admin');
                submit_button('Save Settings');
                ?>
            </form>
        </div>
        <?php
    }

    public function page_init() {
        register_setting('chatbox_ai_option_group', 'chatbox_ai_agent_id');
        register_setting('chatbox_ai_option_group', 'chatbox_ai_admin_only');
        register_setting('chatbox_ai_option_group', 'chatbox_ai_server_url');

        add_settings_section('chatbox_ai_setting_section', 'WordPress Widget Connection Settings', array($this, 'section_info'), 'chatbox-ai-settings-admin');

        add_settings_field('chatbox_ai_agent_id', 'Agent ID', array($this, 'agent_id_callback'), 'chatbox-ai-settings-admin', 'chatbox_ai_setting_section');
        add_settings_field('chatbox_ai_admin_only', 'Testing Mode (Admin Only)', array($this, 'admin_only_callback'), 'chatbox-ai-settings-admin', 'chatbox_ai_setting_section');
        add_settings_field('chatbox_ai_server_url', 'ChatBox Server URL', array($this, 'server_url_callback'), 'chatbox-ai-settings-admin', 'chatbox_ai_setting_section');
    }

    public function section_info() {
        echo 'Paste your Agent ID from the ChatBox AI Dashboard to enable the AI assistant on your website.';
    }

    public function agent_id_callback() {
        $val = esc_attr(get_option('chatbox_ai_agent_id', ''));
        echo '<input type="text" name="chatbox_ai_agent_id" value="' . $val . '" class="regular-text" placeholder="e.g. cmrp4sl270011uwtwukg511mu" required />';
        echo '<p class="description">Copy your Agent ID from <strong>ChatBox AI Dashboard > Widget Customizer > Agent ID</strong>.</p>';
    }

    public function admin_only_callback() {
        $val = get_option('chatbox_ai_admin_only', '1');
        echo '<label><input type="checkbox" name="chatbox_ai_admin_only" value="1" ' . checked('1', $val, false) . ' /> 🧪 <strong>Show Widget for Logged-In Admin Users Only</strong></label>';
        echo '<p class="description">Enable this while testing so only logged-in WordPress Admins can see and test the chatbot. Uncheck when ready to launch live to all website visitors.</p>';
    }

    public function server_url_callback() {
        $val = esc_attr(get_option('chatbox_ai_server_url', 'http://localhost:3000'));
        echo '<input type="text" name="chatbox_ai_server_url" value="' . $val . '" class="regular-text" placeholder="http://localhost:3000" />';
        echo '<p class="description">Your ChatBox AI server domain (default: http://localhost:3000).</p>';
    }

    public function render_widget() {
        $admin_only = get_option('chatbox_ai_admin_only', '1');
        if ($admin_only === '1') {
            if (!is_user_logged_in() || !current_user_can('manage_options')) {
                return; // Hide widget for non-admin visitors during testing mode
            }
        }

        $this->output_script();
    }

    public function render_admin_widget() {
        $admin_only = get_option('chatbox_ai_admin_only', '1');
        if ($admin_only === '1' && is_user_logged_in() && current_user_can('manage_options')) {
            $this->output_script();
        }
    }

    private function output_script() {
        $agent_id = get_option('chatbox_ai_agent_id', '');
        if (empty($agent_id)) {
            return;
        }
        $server_url = rtrim(get_option('chatbox_ai_server_url', 'http://localhost:3000'), '/');
        echo '<script src="' . esc_url($server_url . '/chatbox-widget.js') . '" data-agent-id="' . esc_attr($agent_id) . '" async></script>';
    }
}

new ChatBox_AI_Widget_Plugin();

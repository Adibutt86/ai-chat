<?php
/**
 * Plugin Name: ChatBox AI Widget
 * Plugin URI: https://chatbox-ai.com
 * Description: Connect custom-trained AI chatbots powered by ChatBox AI (Amazon Bedrock / Claude) to your WordPress website instantly.
 * Version: 1.1.0
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
            <p>Connect your WordPress website to your custom-trained ChatBox AI assistant.</p>
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
        register_setting('chatbox_ai_option_group', 'chatbox_ai_connection_type');
        register_setting('chatbox_ai_option_group', 'chatbox_ai_agent_id');
        register_setting('chatbox_ai_option_group', 'chatbox_ai_server_url');
        register_setting('chatbox_ai_option_group', 'chatbox_ai_auto_domain');
        register_setting('chatbox_ai_option_group', 'chatbox_ai_logged_in_only');
        register_setting('chatbox_ai_option_group', 'chatbox_ai_show_in_backend');

        add_settings_section('chatbox_ai_setting_section', 'Connection & Visibility Settings', array($this, 'section_info'), 'chatbox-ai-settings-admin');

        add_settings_field('chatbox_ai_server_url', 'ChatBox Server URL', array($this, 'server_url_callback'), 'chatbox-ai-settings-admin', 'chatbox_ai_setting_section');
        add_settings_field('chatbox_ai_connection_type', 'Connection Method', array($this, 'connection_type_callback'), 'chatbox-ai-settings-admin', 'chatbox_ai_setting_section');
        add_settings_field('chatbox_ai_auto_domain', 'Website Domain (Auto Connect)', array($this, 'auto_domain_callback'), 'chatbox-ai-settings-admin', 'chatbox_ai_setting_section');
        add_settings_field('chatbox_ai_agent_id', 'Agent ID (By ID Mode)', array($this, 'agent_id_callback'), 'chatbox-ai-settings-admin', 'chatbox_ai_setting_section');
        add_settings_field('chatbox_ai_logged_in_only', 'Show Now for Logged-In Users Only (Testing Mode)', array($this, 'logged_in_only_callback'), 'chatbox-ai-settings-admin', 'chatbox_ai_setting_section');
        add_settings_field('chatbox_ai_show_in_backend', 'Enable Widget in WP Admin Backend', array($this, 'show_in_backend_callback'), 'chatbox-ai-settings-admin', 'chatbox_ai_setting_section');
    }

    public function section_info() {
        echo 'Configure your chatbot connection settings and preview visibility:';
    }

    public function server_url_callback() {
        $val = esc_attr(get_option('chatbox_ai_server_url', 'http://localhost:3000'));
        echo '<input type="text" name="chatbox_ai_server_url" value="' . $val . '" class="regular-text" placeholder="http://localhost:3000" />';
    }

    public function connection_type_callback() {
        $val = get_option('chatbox_ai_connection_type', 'auto');
        echo '<label><input type="radio" name="chatbox_ai_connection_type" value="auto" ' . checked('auto', $val, false) . ' /> ⚡ <strong>Auto Connect</strong> (Pair using domain URL automatically)</label><br/><br/>';
        echo '<label><input type="radio" name="chatbox_ai_connection_type" value="id" ' . checked('id', $val, false) . ' /> 🔑 <strong>Connect By Agent ID</strong> (Enter manual Agent CUID from dashboard)</label>';
    }

    public function auto_domain_callback() {
        $val = esc_attr(get_option('chatbox_ai_auto_domain', get_site_url()));
        echo '<input type="text" name="chatbox_ai_auto_domain" value="' . $val . '" class="regular-text" placeholder="https://mywebsite.com" />';
        echo '<p class="description">Auto Connect pairs your chatbot using your WordPress site domain URL without requiring manual IDs.</p>';
    }

    public function agent_id_callback() {
        $val = esc_attr(get_option('chatbox_ai_agent_id', ''));
        echo '<input type="text" name="chatbox_ai_agent_id" value="' . $val . '" class="regular-text" placeholder="e.g. cm78xyz123..." />';
        echo '<p class="description">Copy your Agent ID from ChatBox AI Dashboard > Agent Settings.</p>';
    }

    public function logged_in_only_callback() {
        $val = get_option('chatbox_ai_logged_in_only', '0');
        echo '<label><input type="checkbox" name="chatbox_ai_logged_in_only" value="1" ' . checked('1', $val, false) . ' /> 🧪 <strong>Show Now for Logged-In Users Only</strong> (Enable this while testing; uncheck later to publish live to all visitors)</label>';
    }

    public function show_in_backend_callback() {
        $val = get_option('chatbox_ai_show_in_backend', '0');
        echo '<label><input type="checkbox" name="chatbox_ai_show_in_backend" value="1" ' . checked('1', $val, false) . ' /> 🛠️ <strong>Enable inside WP-Admin Backend</strong> (Renders the widget inside your WP Admin area for easy testing)</label>';
    }

    public function render_widget() {
        $logged_in_only = get_option('chatbox_ai_logged_in_only', '0');
        if ($logged_in_only === '1' && !is_user_logged_in()) {
            return; // Hide for public visitors during testing mode
        }

        $this->output_script();
    }

    public function render_admin_widget() {
        $show_in_backend = get_option('chatbox_ai_show_in_backend', '0');
        if ($show_in_backend === '1') {
            $this->output_script();
        }
    }

    private function output_script() {
        $connection_type = get_option('chatbox_ai_connection_type', 'auto');
        $agent_id = get_option('chatbox_ai_agent_id', '');
        $server_url = rtrim(get_option('chatbox_ai_server_url', 'http://localhost:3000'), '/');
        $auto_domain = get_option('chatbox_ai_auto_domain', get_site_url());

        if ($connection_type === 'id' && !empty($agent_id)) {
            echo '<script src="' . esc_url($server_url . '/chatbox-widget.js') . '" data-agent-id="' . esc_attr($agent_id) . '" async></script>';
        } else {
            echo '<script src="' . esc_url($server_url . '/chatbox-widget.js') . '" data-agent-id="demo" data-auto-domain="' . esc_attr($auto_domain) . '" async></script>';
        }
    }
}

new ChatBox_AI_Widget_Plugin();

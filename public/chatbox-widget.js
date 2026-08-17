/**
 * Geekvista Widget Core Embedded Script
 * Renders floating action buttons and loaded custom dialogs on external webpages.
 * Includes interactive booking system wizard flow.
 */
(function() {
  // 1. Extract agent configuration script attributes
  const currentScript = document.currentScript;
  const agentId = currentScript ? currentScript.getAttribute('data-agent-id') : null;
  const isDashboard = currentScript ? currentScript.getAttribute('data-dashboard') === 'true' : false;

  if (!agentId) {
    console.error('Geekvista Widget error: missing "data-agent-id" attribute on script element.');
    return;
  }

  // Prevent global static script loading on the dashboard page
  if (window.location.pathname.startsWith('/dashboard') && !isDashboard) {
    return;
  }

  // 2. Fetch origin configuration settings dynamically
  const origin = new URL(currentScript.src).origin;
  
  fetch(`${origin}/api/widget/init?agentId=${agentId}`)
    .then(res => res.json())
    .then(config => {
      buildWidget(config, origin);
    })
    .catch(err => {
      console.error('Failed to initialize Geekvista Widget:', err);
    });

  function buildWidget(config, origin) {
    const existingContainer = document.getElementById('chatbox-widget-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    // 3. Inject global style definitions
    const style = document.createElement('style');
    const primaryColor = config.widgetSettings?.primaryColor || '#2563eb';
    const secondaryColor = config.widgetSettings?.secondaryColor || primaryColor;
    const borderRadius = config.widgetSettings?.borderRadius || '0.75rem';
    const welcomeMessage = config.widgetSettings?.welcomeMessage || 'Hi! How can I help you today?';
    const placeholder = config.widgetSettings?.placeholder || 'Type your message...';
    const position = config.widgetSettings?.position || 'bottom-right';

    style.innerHTML = `
      /* Strict CSS Isolation Reset: Prevents WordPress Theme CSS leakage */
      #chatbox-widget-container,
      #chatbox-widget-container *,
      #chatbox-widget-container *::before,
      #chatbox-widget-container *::after {
        box-sizing: border-box !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
        -webkit-font-smoothing: antialiased;
        letter-spacing: normal;
        text-transform: none;
        text-indent: 0;
        text-shadow: none;
      }

      #chatbox-widget-container button,
      #chatbox-widget-container input,
      #chatbox-widget-container textarea {
        font-family: inherit !important;
        margin: 0;
      }

      #chatbox-widget-container {
        position: fixed;
        bottom: 24px;
        ${position === 'bottom-right' ? 'right: 24px;' : 'left: 24px;'}
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        display: flex;
        flex-direction: column;
        align-items: ${position === 'bottom-right' ? 'flex-end' : 'flex-start'};
        pointer-events: none;
      }
      #chatbox-launcher {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor || primaryColor});
        border: 2px solid rgba(255, 255, 255, 0.6);
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22), 0 3px 8px rgba(0, 0, 0, 0.12);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease, border-color 0.3s ease;
        position: relative;
        pointer-events: auto;
        outline: none;
      }
      #chatbox-launcher:hover {
        transform: scale(1.08) translateY(-2px);
        border-color: #ffffff;
        box-shadow: 0 14px 36px rgba(0, 0, 0, 0.28);
      }
      #chatbox-launcher:active {
        transform: scale(0.94);
      }
      #chatbox-launcher .icon-svg {
        position: absolute;
        transition: transform 0.3s ease, opacity 0.3s ease;
      }
      #chatbox-launcher .icon-chat {
        width: 42px;
        height: 42px;
      }
      #chatbox-launcher .icon-close {
        opacity: 0;
        transform: rotate(-45deg) scale(0.6);
        fill: none;
        stroke: white;
        width: 28px;
        height: 28px;
      }
      #chatbox-launcher.open .icon-chat {
        opacity: 0;
        transform: rotate(45deg) scale(0.6);
      }
      #chatbox-launcher.open .icon-close {
        opacity: 1;
        transform: rotate(0deg) scale(1);
      }
      
      /* Launcher pulse animation */
      #chatbox-launcher::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: ${primaryColor};
        opacity: 0.4;
        z-index: -1;
        animation: chatbox-pulse 3s infinite;
      }
      @keyframes chatbox-pulse {
        0% {
          transform: scale(1);
          opacity: 0.4;
        }
        50% {
          transform: scale(1.2);
          opacity: 0;
        }
        100% {
          transform: scale(1);
          opacity: 0;
        }
      }

      /* Notification Badge */
      #chatbox-badge {
        position: absolute;
        top: -2px;
        right: -2px;
        width: 14px;
        height: 14px;
        background-color: #ef4444;
        border: 2px solid white;
        border-radius: 50%;
        display: none;
      }

      #chatbox-window {
        display: flex;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform-origin: ${position === 'bottom-right' ? 'bottom right' : 'bottom left'};
        transform: translateY(24px) scale(0.84);
        width: ${config.widgetSettings?.width || '385px'};
        height: ${config.widgetSettings?.height || '590px'};
        background: #ffffff;
        border: 1px solid #f1f5f9;
        border-radius: ${borderRadius};
        box-shadow: 0 16px 48px -4px rgba(0, 0, 0, 0.18), 0 8px 24px -4px rgba(0, 0, 0, 0.08);
        position: absolute;
        bottom: 78px;
        ${position === 'bottom-right' ? 'right: 0;' : 'left: 0;'}
        flex-direction: column;
        overflow: hidden;
        transition: visibility 0.35s ease, opacity 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      #chatbox-window.active {
        display: flex;
        visibility: visible;
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0) scale(1);
        animation: chatboxSpringPop 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }

      @keyframes chatboxSpringPop {
        0% {
          opacity: 0;
          transform: translateY(28px) scale(0.82);
        }
        70% {
          opacity: 1;
          transform: translateY(-5px) scale(1.02);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      #chatbox-header {
        background-color: #ffffff;
        color: #0f172a;
        padding: 16px 20px;
        font-weight: 600;
        font-size: 15px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #f1f5f9;
      }
      .chatbox-header-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .chatbox-avatar-container {
        position: relative;
        width: 38px;
        height: 38px;
      }
      .chatbox-avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        background-color: #f1f5f9;
        border: 1px solid #e2e8f0;
      }
      .chatbox-status-indicator {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #10b981;
        border: 2px solid white;
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
      }
      .chatbox-header-title {
        display: flex;
        flex-direction: column;
      }
      .chatbox-header-name {
        font-size: 15px;
        font-weight: 600;
        color: #0f172a;
      }
      .chatbox-header-status {
        font-size: 11px;
        color: #10b981;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .chatbox-header-actions {
        display: flex;
        gap: 8px;
      }
      .chatbox-header-btn {
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        color: #1e293b;
        padding: 6px;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s, color 0.2s, border-color 0.2s;
      }
      .chatbox-header-btn svg {
        display: block !important;
        width: 16px !important;
        height: 16px !important;
        stroke: #1e293b !important;
        color: #1e293b !important;
        fill: none !important;
        stroke-width: 2px !important;
      }
      .chatbox-header-btn:hover {
        background-color: #e2e8f0;
        border-color: #94a3b8;
      }
      .chatbox-header-btn:hover svg {
        stroke: #0f172a !important;
        color: #0f172a !important;
      }
      
      #chatbox-body {
        flex: 1 1 0% !important;
        min-height: 0 !important;
        max-height: 100% !important;
        padding: 14px 14px;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        background-color: #f8fafc;
        display: flex;
        flex-direction: column;
        gap: 14px;
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch !important;
        touch-action: pan-y !important;
        pointer-events: auto !important;
        box-sizing: border-box !important;
        overscroll-behavior: contain !important;
        overscroll-behavior-y: contain !important;
        scrollbar-width: thin !important;
        scrollbar-color: #94a3b8 #f1f5f9 !important;
      }
      #chatbox-body::-webkit-scrollbar {
        width: 7px !important;
        height: 7px !important;
      }
      #chatbox-body::-webkit-scrollbar-track {
        background: #f1f5f9 !important;
        border-radius: 4px !important;
      }
      #chatbox-body::-webkit-scrollbar-thumb {
        background-color: #94a3b8 !important;
        border-radius: 4px !important;
        border: 1px solid #f1f5f9 !important;
      }
      #chatbox-body::-webkit-scrollbar-thumb:hover {
        background-color: #64748b !important;
      }
      #chatbox-body::-webkit-scrollbar-thumb:active {
        background-color: #475569 !important;
      }
      
      /* Messages Styles */
      .chatbox-message-row {
        display: flex;
        gap: 8px;
        max-width: 96%;
        opacity: 0;
        transform: translateY(8px);
        animation: chatbox-message-in 0.3s forwards cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes chatbox-message-in {
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .chatbox-message-row.bot {
        align-self: flex-start;
        max-width: 98%;
        width: 98%;
      }
      .chatbox-message-row.user {
        align-self: flex-end;
        max-width: 90%;
        flex-direction: row-reverse;
      }
      .chatbox-message-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background-color: #e2e8f0;
        align-self: flex-end;
        object-fit: cover;
        border: 1px solid #cbd5e1;
        flex-shrink: 0;
        display: block;
      }
      .chatbox-message {
        padding: 12px 16px;
        border-radius: 16px;
        font-size: 13.5px;
        line-height: 1.5;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        word-break: break-word !important;
        overflow-wrap: break-word !important;
        white-space: normal !important;
        letter-spacing: normal !important;
      }
      .chatbox-message-row.bot .chatbox-message {
        background-color: #ffffff;
        color: #1e293b;
        border-bottom-left-radius: 4px;
        border: 1px solid #f1f5f9;
      }
      .chatbox-message-row.bot .chatbox-message a,
      .chatbox-message-row.bot .chatbox-link {
        color: ${primaryColor} !important;
        text-decoration: underline !important;
        font-weight: 500 !important;
      }
      .chatbox-message-row.user .chatbox-message {
        background-color: ${primaryColor};
        color: #ffffff;
        border-bottom-right-radius: 4px;
      }
      .chatbox-message-row.user .chatbox-message a,
      .chatbox-message-row.user .chatbox-link {
        color: #ffffff !important;
        text-decoration: underline !important;
        font-weight: 600 !important;
      }
      .chatbox-message strong {
        font-weight: 600;
        display: inline-block;
        padding-bottom: 4px;
        margin-bottom: 2px;
      }
      
      .chatbox-list-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin: 6px 0;
        font-size: 13px;
        line-height: 1.45;
      }
      .chatbox-list-item:first-of-type {
        margin-top: 8px;
      }
      .chatbox-list-item:last-of-type {
        margin-bottom: 8px;
      }
      .chatbox-list-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 17px;
        height: 17px;
        border-radius: 50%;
        background-color: ${primaryColor}18;
        color: ${primaryColor};
        font-size: 11px;
        font-weight: 700;
        flex-shrink: 0;
        margin-top: 1px;
      }
      
      #chatbox-sticky-suggestions {
        background-color: #ffffff;
        border-bottom: 1px solid #f1f5f9;
        padding: 8px 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        flex-shrink: 0;
        overflow: visible !important;
        position: relative;
        z-index: 9999;
      }

      .chatbox-suggestions-container {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 8px;
        width: 100%;
        position: relative;
        overflow: visible !important;
        z-index: 9999;
      }
      
      .chatbox-suggestion-pill {
        position: relative;
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        color: #334155;
        width: 34px;
        height: 34px;
        border-radius: 10px;
        font-size: 15px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        flex-shrink: 0;
        margin: 0 !important;
        padding: 0 !important;
        outline: none;
        z-index: 1;
      }
      .chatbox-suggestion-pill span {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }
      .chatbox-suggestion-pill:hover {
        background-color: ${primaryColor};
        color: #ffffff !important;
        border-color: ${primaryColor};
        transform: translateY(-2px);
        box-shadow: 0 4px 10px ${primaryColor}35;
        z-index: 10000 !important;
      }

      /* Hover Tooltip Popup - Placed ABOVE the pill so it is never hidden at the bottom */
      .chatbox-suggestion-pill::after {
        content: attr(data-title);
        position: absolute;
        bottom: calc(100% + 8px);
        left: 50%;
        transform: translateX(-50%) translateY(4px) scale(0.9);
        background-color: #0f172a;
        color: #ffffff;
        padding: 5px 10px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 99999 !important;
        box-shadow: 0 4px 14px rgba(0,0,0,0.25);
      }
      .chatbox-suggestion-pill::before {
        content: '';
        position: absolute;
        bottom: calc(100% + 2px);
        left: 50%;
        transform: translateX(-50%);
        border-width: 6px 5px 0 5px;
        border-style: solid;
        border-color: #0f172a transparent transparent transparent;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
        z-index: 100000 !important;
      }
      .chatbox-suggestion-pill:hover::after {
        opacity: 1;
        transform: translateX(-50%) translateY(0) scale(1);
      }
      .chatbox-suggestion-pill:hover::before {
        opacity: 1;
      }

      /* First & last pill tooltip edge-alignment to prevent clipping */
      .chatbox-suggestions-container .chatbox-suggestion-pill:first-child::after {
        left: 0;
        transform: translateX(0) translateY(4px) scale(0.9);
      }
      .chatbox-suggestions-container .chatbox-suggestion-pill:first-child:hover::after {
        transform: translateX(0) translateY(0) scale(1);
      }
      .chatbox-suggestions-container .chatbox-suggestion-pill:first-child::before {
        left: 12px;
        transform: translateX(0);
      }

      .chatbox-suggestions-container .chatbox-suggestion-pill:last-child::after {
        left: auto;
        right: 0;
        transform: translateX(0) translateY(4px) scale(0.9);
      }
      .chatbox-suggestions-container .chatbox-suggestion-pill:last-child:hover::after {
        transform: translateX(0) translateY(0) scale(1);
      }
      .chatbox-suggestions-container .chatbox-suggestion-pill:last-child::before {
        left: auto;
        right: 12px;
        transform: translateX(0);
      }

      /* Interactive Clickable Related Questions Pills */
      .chatbox-related-questions-box {
        margin-top: 10px;
        padding-top: 8px;
        border-top: 1px solid rgba(0,0,0,0.06);
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 100%;
        box-sizing: border-box;
      }
      .chatbox-related-header {
        font-size: 12px;
        font-weight: 700;
        color: #334155;
        margin-bottom: 2px;
      }
      .chatbox-related-pill {
        display: flex;
        align-items: center;
        gap: 8px;
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 7px 11px;
        color: #0f172a;
        font-size: 12px;
        font-weight: 500;
        text-align: left;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        width: 100%;
        box-sizing: border-box;
        line-height: 1.35;
      }
      .chatbox-related-pill:hover {
        background-color: ${primaryColor}12;
        border-color: ${primaryColor}60;
        color: ${primaryColor};
        transform: translateX(3px);
        box-shadow: 0 2px 6px ${primaryColor}15;
      }
      .chatbox-related-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 17px;
        height: 17px;
        border-radius: 50%;
        background-color: #10b98120;
        color: #10b981;
        font-size: 10px;
        font-weight: 800;
        flex-shrink: 0;
      }
      
      /* Scrolling Helper */
      #chatbox-scroll-latest {
        position: absolute;
        bottom: 90px;
        left: 50%;
        transform: translateX(-50%) translateY(10px);
        background-color: #ffffff;
        color: #334155;
        padding: 8px 14px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        display: none;
        align-items: center;
        gap: 6px;
        border: 1px solid #e2e8f0;
        z-index: 10;
        transition: opacity 0.2s, transform 0.2s;
        pointer-events: auto;
      }
      #chatbox-scroll-latest.visible {
        display: flex;
        animation: chatbox-bounce-in 0.2s forwards;
      }
      @keyframes chatbox-bounce-in {
        from { opacity: 0; transform: translateX(-50%) translateY(10px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }

      /* Animated Typing Indicator */
      .typing-indicator {
        display: flex;
        gap: 4px;
        align-items: center;
        padding: 4px 0;
      }
      .typing-dot {
        width: 6px;
        height: 6px;
        background-color: #94a3b8;
        border-radius: 50%;
        animation: typing-bounce 1.4s infinite ease-in-out both;
      }
      .typing-dot:nth-child(1) { animation-delay: -0.32s; }
      .typing-dot:nth-child(2) { animation-delay: -0.16s; }
      @keyframes typing-bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1.0); }
      }

      /* Streaming Blink Cursor */
      .streaming-cursor::after {
        content: '▋';
        color: ${primaryColor};
        font-size: 12px;
        margin-left: 2px;
        animation: cursor-blink 0.8s infinite;
      }
      @keyframes cursor-blink {
        0%, 100% { opacity: 0; }
        50% { opacity: 1; }
      }

      /* Footer Input Area */
      #chatbox-footer-wrapper {
        background-color: #ffffff;
        border-top: 1px solid #f1f5f9;
        display: flex;
        flex-direction: column;
      }
      #chatbox-footer {
        padding: 14px 16px;
        display: flex;
        align-items: flex-end;
        gap: 8px;
      }
      #chatbox-input-container {
        flex: 1;
        position: relative;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        transition: border-color 0.2s, box-shadow 0.2s;
        display: flex;
        align-items: flex-end;
      }
      #chatbox-input-container:focus-within {
        border-color: ${primaryColor};
        box-shadow: 0 0 0 2px ${primaryColor}20;
        background: #ffffff;
      }
      #chatbox-input {
        flex: 1;
        border: none;
        background: transparent !important;
        padding: 10px 12px;
        font-size: 13.5px;
        outline: none;
        color: #1e293b !important;
        resize: none;
        max-height: 100px;
        min-height: 20px;
        font-family: inherit;
        line-height: 1.4;
        box-sizing: border-box;
        overflow-y: auto;
        scrollbar-width: none;
      }
      #chatbox-input::-webkit-scrollbar {
        display: none;
      }
      #chatbox-send-btn {
        background-color: ${primaryColor};
        color: white;
        border: none;
        border-radius: 10px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s, opacity 0.2s, background-color 0.2s;
        margin: 4px;
        flex-shrink: 0;
      }
      #chatbox-send-btn:hover {
        opacity: 0.95;
      }
      #chatbox-send-btn:disabled {
        background-color: #e2e8f0;
        color: #94a3b8;
        cursor: not-allowed;
      }
      
      .chatbox-branding {
        text-align: center;
        font-size: 10px;
        color: #94a3b8;
        padding: 6px 0 10px 0;
        background: #ffffff;
        border-top: 1px solid #f8fafc;
        letter-spacing: 0.5px;
        font-weight: 500;
      }
      .chatbox-branding a {
        color: #64748b;
        text-decoration: none;
        font-weight: 600;
      }
      .chatbox-branding a:hover {
        text-decoration: underline;
      }

      /* Booking Wizard Card design updates */
      .chatbox-message-row.booking-wizard-container {
        max-width: 100% !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      .booking-wizard,
      .booking-wizard * {
        box-sizing: border-box !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
      }
      .booking-wizard {
        background: #ffffff !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 16px !important;
        padding: 16px !important;
        margin-top: 8px !important;
        font-size: 13px !important;
        color: #334155 !important;
        width: 100% !important;
        max-width: 100% !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03) !important;
        line-height: 1.4 !important;
      }
      .booking-wizard h4 {
        margin: 0 0 12px 0 !important;
        padding: 0 !important;
        font-size: 14.5px !important;
        font-weight: 600 !important;
        color: #0f172a !important;
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        line-height: 1.3 !important;
      }
      .booking-btn {
        width: 100% !important;
        background-color: #f8fafc !important;
        border: 1px solid #e2e8f0 !important;
        color: #334155 !important;
        padding: 10px 14px !important;
        border-radius: 10px !important;
        margin-bottom: 8px !important;
        text-align: left !important;
        cursor: pointer !important;
        font-size: 13px !important;
        transition: all 0.2s !important;
        display: flex !important;
        flex-direction: column !important;
        line-height: 1.4 !important;
        box-shadow: none !important;
        appearance: none !important;
        -webkit-appearance: none !important;
      }
      .booking-btn:hover {
        background-color: #f1f5f9 !important;
        border-color: #cbd5e1 !important;
        transform: translateY(-1px) !important;
      }
      .booking-btn-primary {
        background-color: ${primaryColor} !important;
        color: white !important;
        border: none !important;
        text-align: center !important;
        justify-content: center !important;
        align-items: center !important;
        font-weight: 600 !important;
      }
      .booking-btn-primary:hover {
        background-color: ${primaryColor} !important;
        opacity: 0.95 !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 12px ${primaryColor}30 !important;
      }
      .booking-grid {
        display: grid !important;
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 8px !important;
        margin-top: 10px !important;
        max-height: 140px !important;
        overflow-y: auto !important;
        padding-right: 4px !important;
      }
      .booking-grid-item {
        background-color: #f8fafc !important;
        border: 1px solid #e2e8f0 !important;
        text-align: center !important;
        padding: 8px !important;
        border-radius: 8px !important;
        cursor: pointer !important;
        font-size: 12px !important;
        font-weight: 500 !important;
        transition: all 0.2s !important;
        line-height: 1.3 !important;
        color: #1e293b !important;
      }
      .booking-grid-item:hover, .booking-grid-item.selected {
        background-color: ${primaryColor} !important;
        color: white !important;
        border-color: ${primaryColor} !important;
      }

      /* Mini Interactive Calendar Styles */
      .booking-calendar-header {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        margin-bottom: 10px !important;
        background: #f8fafc !important;
        padding: 6px 10px !important;
        border-radius: 10px !important;
        border: 1px solid #e2e8f0 !important;
        width: 100% !important;
      }
      .booking-calendar-title {
        font-weight: 600 !important;
        font-size: 13px !important;
        color: #0f172a !important;
        margin: 0 !important;
        padding: 0 !important;
        line-height: 1 !important;
      }
      .booking-calendar-nav {
        background: #ffffff !important;
        border: 1px solid #cbd5e1 !important;
        border-radius: 6px !important;
        width: 26px !important;
        height: 26px !important;
        min-width: 26px !important;
        min-height: 26px !important;
        max-width: 26px !important;
        max-height: 26px !important;
        padding: 0 !important;
        margin: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        font-size: 12px !important;
        color: #1e293b !important;
        transition: all 0.2s !important;
        line-height: 1 !important;
        outline: none !important;
        box-shadow: none !important;
        appearance: none !important;
        -webkit-appearance: none !important;
      }
      .booking-calendar-nav:hover {
        background: ${primaryColor} !important;
        color: #ffffff !important;
        border-color: ${primaryColor} !important;
      }
      .booking-calendar-grid {
        display: grid !important;
        grid-template-columns: repeat(7, 1fr) !important;
        gap: 4px !important;
        text-align: center !important;
        margin-bottom: 8px !important;
        width: 100% !important;
      }
      .booking-calendar-day-header {
        font-size: 10px !important;
        font-weight: 700 !important;
        color: #64748b !important;
        padding: 4px 0 !important;
        margin: 0 !important;
        text-transform: uppercase !important;
        line-height: 1 !important;
      }
      .booking-calendar-cell {
        padding: 7px 2px !important;
        border-radius: 8px !important;
        font-size: 12px !important;
        border: 1px solid transparent !important;
        cursor: pointer !important;
        transition: all 0.2s !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        min-height: 32px !important;
        height: 32px !important;
        margin: 0 !important;
        line-height: 1 !important;
        user-select: none !important;
      }
      .booking-calendar-cell.available {
        background-color: #f0fdf4 !important;
        color: #166534 !important;
        border-color: #bbf7d0 !important;
        font-weight: 600 !important;
      }
      .booking-calendar-cell.available:hover {
        background-color: ${primaryColor} !important;
        color: white !important;
        border-color: ${primaryColor} !important;
        transform: scale(1.04) !important;
      }
      .booking-calendar-cell.disabled {
        color: #94a3b8 !important;
        cursor: not-allowed !important;
        background-color: #f1f5f9 !important;
        opacity: 0.45 !important;
        pointer-events: none !important;
        text-decoration: line-through !important;
        border-color: transparent !important;
      }
      .booking-calendar-cell.selected {
        background-color: ${primaryColor} !important;
        color: white !important;
        font-weight: 700 !important;
        border-color: ${primaryColor} !important;
      }
      .booking-input {
        width: 100% !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 8px !important;
        padding: 8px 12px !important;
        font-size: 13px !important;
        margin-bottom: 12px !important;
        background-color: #ffffff !important;
        color: #1e293b !important;
        outline: none !important;
        transition: border-color 0.2s !important;
        line-height: 1.4 !important;
        box-shadow: none !important;
      }
      .booking-input:focus {
        border-color: ${primaryColor} !important;
      }
      .booking-textarea {
        font-family: inherit !important;
        resize: none !important;
        overflow-y: hidden !important;
        min-height: 48px !important;
        line-height: 1.45 !important;
        transition: height 0.15s ease-out !important;
      }
      .booking-label {
        font-size: 10.5px !important;
        text-transform: uppercase !important;
        font-weight: 600 !important;
        color: #64748b !important;
        margin-bottom: 6px !important;
        display: block !important;
        letter-spacing: 0.5px !important;
        line-height: 1.2 !important;
      }
      .booking-summary-row {
        display: flex !important;
        justify-content: space-between !important;
        margin-bottom: 8px !important;
        border-bottom: 1px dashed #f1f5f9 !important;
        padding-bottom: 6px !important;
        font-size: 12.5px !important;
        line-height: 1.3 !important;
      }
      .booking-summary-label {
        color: #64748b !important;
      }
      .booking-summary-val {
        font-weight: 600 !important;
        color: #0f172a !important;
        text-align: right !important;
      }

      /* Skeleton loader styles */
      .booking-skeleton {
        animation: pulse-bg 1.5s infinite ease-in-out;
        background-color: #e2e8f0;
        border-radius: 8px;
        height: 38px;
        margin-bottom: 8px;
        width: 100%;
      }
      .booking-skeleton:last-child {
        width: 70%;
      }
      @keyframes pulse-bg {
        0%, 100% { background-color: #f1f5f9; }
        50% { background-color: #e2e8f0; }
      }

      /* Native feeling full screen mode on Mobile Devices */
      @media (max-width: 640px) {
        #chatbox-widget-container {
          bottom: 0 !important;
          right: 0 !important;
          left: 0 !important;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        #chatbox-launcher {
          position: fixed;
          bottom: 16px;
          right: 16px;
          z-index: 999999;
        }
        #chatbox-window {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          top: 0;
          width: 100% !important;
          height: 100% !important;
          border-radius: 0 !important;
          border: none !important;
          box-shadow: none !important;
          bottom: 0 !important;
        }
        #chatbox-body {
          padding: 16px;
        }
        #chatbox-scroll-latest {
          bottom: 110px;
        }
      }
    `;
    document.head.appendChild(style);

    // 4. Create widget HTML structure
    const container = document.createElement('div');
    container.id = 'chatbox-widget-container';
    
    // Set custom bot avatar or use neat inline avatar representation
    const avatarImg = config.avatarUrl 
      ? `<img src="${config.avatarUrl}" class="chatbox-avatar" alt="${config.name || 'AI Assistant'}" />`
      : `<svg class="chatbox-avatar" style="padding: 4px; box-sizing: border-box;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2z"/><path d="M12 6v6l4 2"/></svg>`;

    function getSuggestionsHTML() {
      let html = '';
      const showBooking = config.widgetSettings?.showBooking !== false;
      const showLeadForm = config.widgetSettings?.showLeadForm !== false;
      const showServices = config.widgetSettings?.showServices === true;
      const showHours = config.widgetSettings?.showHours === true;
      const showTripForm = config.widgetSettings?.showTripForm === true;

      if (showBooking || showLeadForm || showServices || showHours || showTripForm) {
        html += '<div class="chatbox-suggestions-container" id="chatbox-welcome-suggestions">';
        if (showBooking) {
          html += `
            <button class="chatbox-suggestion-pill" id="chatbox-suggest-book" data-title="Book Appointment" title="Book Appointment" aria-label="Book Appointment">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </button>
          `;
        }
        if (showLeadForm) {
          html += `
            <button class="chatbox-suggestion-pill" id="chatbox-suggest-lead" data-title="Contact us" title="Contact us" aria-label="Contact us">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </button>
          `;
        }
        if (showTripForm) {
          html += `
            <button class="chatbox-suggestion-pill" id="chatbox-suggest-trip" data-title="Request Trip Details" title="Request Trip Details" aria-label="Request Trip Details">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
            </button>
          `;
        }
        if (showServices) {
          html += `
            <button class="chatbox-suggestion-pill" id="chatbox-suggest-services" data-title="Our Services" title="Our Services" aria-label="Our Services">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            </button>
          `;
        }
        if (showHours) {
          html += `
            <button class="chatbox-suggestion-pill" id="chatbox-suggest-hours" data-title="Business Working Hours" title="Business Working Hours" aria-label="Business Working Hours">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </button>
          `;
        }
        html += '</div>';
      }
      return html;
    }

    container.innerHTML = `
      <div id="chatbox-window" role="dialog" aria-label="AI Chat Window">
        <div id="chatbox-header">
          <div class="chatbox-header-info">
            <div class="chatbox-avatar-container">
              ${avatarImg}
              <div class="chatbox-status-indicator" aria-label="Online"></div>
            </div>
            <div class="chatbox-header-title">
              <span class="chatbox-header-name">${config.name || 'AI Assistant'}</span>
              <span class="chatbox-header-status">
                <svg width="6" height="6" viewBox="0 0 6 6" fill="#10b981"><circle cx="3" cy="3" r="3"/></svg>
                Online
              </span>
            </div>
          </div>
          <div class="chatbox-header-actions">
            <button class="chatbox-header-btn" id="chatbox-clear-btn" title="Clear Chat History" aria-label="Clear Chat History">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
            <button class="chatbox-header-btn" id="chatbox-minimize-btn" title="Minimize Chat" aria-label="Minimize Chat">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <button class="chatbox-header-btn" id="chatbox-close-x" title="Close Chat" aria-label="Close Chat">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
        <div id="chatbox-sticky-suggestions">
          ${getSuggestionsHTML()}
        </div>
        <div id="chatbox-body" role="log">
          <div class="chatbox-message-row bot">
            ${avatarImg.replace('chatbox-avatar', 'chatbox-message-avatar')}
            <div class="chatbox-message">${welcomeMessage}</div>
          </div>
        </div>
        <button id="chatbox-scroll-latest">
          <span>New messages</span>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <div id="chatbox-footer-wrapper">
          <div id="chatbox-footer">
            <div id="chatbox-input-container">
              <textarea id="chatbox-input" rows="1" placeholder="${placeholder}" aria-label="Type your message"></textarea>
            </div>
            <button id="chatbox-send-btn" disabled aria-label="Send message">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
          <div class="chatbox-branding">
            Powered by <a href="https://nyxens.com/" target="_blank" rel="noopener">Nyxens</a>
          </div>
        </div>
      </div>
      <button id="chatbox-launcher" aria-label="Open Chat Support" aria-haspopup="dialog">
        <span id="chatbox-badge"></span>
        <svg class="icon-svg icon-chat" viewBox="36 16 56 60" width="42" height="42" fill="none">
          <!-- Inner AI Geometric Nodes (No Bubble Outline) -->
          <polygon points="64,24 84,35 84,57 64,68 44,57 44,35" fill="none" stroke="#FFFFFF" stroke-width="4.5" stroke-linejoin="round"/>
          <path d="M54 46H74" stroke="#F97316" stroke-width="5" stroke-linecap="round"/>
          <!-- Node Dots -->
          <circle cx="64" cy="24" r="4" fill="#38BDF8"/>
          <circle cx="84" cy="35" r="4" fill="#38BDF8"/>
          <circle cx="74" cy="46" r="4" fill="#F97316"/>
          <circle cx="46" cy="56" r="4" fill="#38BDF8"/>
        </svg>
        <svg class="icon-svg icon-close" viewBox="0 0 24 24" width="28" height="28"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    `;

    document.body.appendChild(container);

    // 5. Connect user interface event listeners
    const launcher = document.getElementById('chatbox-launcher');
    const windowDiv = document.getElementById('chatbox-window');
    const closeX = document.getElementById('chatbox-close-x');
    const minimizeBtn = document.getElementById('chatbox-minimize-btn');
    const sendBtn = document.getElementById('chatbox-send-btn');
    const input = document.getElementById('chatbox-input');
    const body = document.getElementById('chatbox-body');
    const scrollLatestBtn = document.getElementById('chatbox-scroll-latest');
    const badge = document.getElementById('chatbox-badge');

    let leadSubmitted = localStorage.getItem('chatbox_lead_submitted') === 'true';
    let visitorName = localStorage.getItem('chatbox_visitor_name') || '';
    let visitorEmail = localStorage.getItem('chatbox_visitor_email') || '';
    let visitorPhone = localStorage.getItem('chatbox_visitor_phone') || '';

    function updateChatInputLock() {
      const showLeadForm = config.widgetSettings?.showLeadForm !== false;
      if (showLeadForm && !leadSubmitted) {
        if (input) {
          input.disabled = true;
          input.placeholder = "Please introduce yourself...";
          input.style.cursor = "not-allowed";
          input.style.backgroundColor = "#f1f5f9";
          input.style.opacity = "0.6";
        }
        if (sendBtn) {
          sendBtn.disabled = true;
          sendBtn.style.opacity = "0.4";
          sendBtn.style.cursor = "not-allowed";
        }
      } else {
        if (input) {
          input.disabled = false;
          input.placeholder = config.widgetSettings?.placeholder || "Type your message...";
          input.style.cursor = "text";
          input.style.backgroundColor = "";
          input.style.opacity = "1";
        }
        if (sendBtn) {
          sendBtn.disabled = input ? input.value.trim().length === 0 : false;
          sendBtn.style.opacity = "1";
          sendBtn.style.cursor = "pointer";
        }
      }
    }

    // Auto-resizing textarea implementation
    input.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
      
      const showLeadForm = config.widgetSettings?.showLeadForm !== false;
      if (showLeadForm && !leadSubmitted) {
        sendBtn.disabled = true;
        return;
      }

      // Update send button state
      if (this.value.trim().length > 0) {
        sendBtn.disabled = false;
      } else {
        sendBtn.disabled = true;
      }
    });

    updateChatInputLock();

    function connectSuggestionsListeners() {
      function scrollToBottom() {
        setTimeout(() => {
          body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' });
        }, 60);
      }

      const suggestBookBtn = document.getElementById('chatbox-suggest-book');
      if (suggestBookBtn) {
        suggestBookBtn.onclick = () => {
          removeSuggestions();
          appendMessage('user', 'I want to book an appointment');
          appendBookingWidget();
          scrollToBottom();
        };
      }
      const suggestLeadBtn = document.getElementById('chatbox-suggest-lead');
      if (suggestLeadBtn) {
        suggestLeadBtn.onclick = () => {
          removeSuggestions();
          appendLeadFormWidget();
          scrollToBottom();
        };
      }
      const suggestTripBtn = document.getElementById('chatbox-suggest-trip');
      if (suggestTripBtn) {
        suggestTripBtn.onclick = () => {
          removeSuggestions();
          appendTripFormWidget();
          scrollToBottom();
        };
      }
      const suggestHoursBtn = document.getElementById('chatbox-suggest-hours');
      if (suggestHoursBtn) {
        suggestHoursBtn.onclick = () => {
          removeSuggestions();
          input.value = 'What are your business working hours?';
          input.dispatchEvent(new Event('input'));
          handleSend();
          scrollToBottom();
        };
      }
      const suggestServicesBtn = document.getElementById('chatbox-suggest-services');
      if (suggestServicesBtn) {
        suggestServicesBtn.onclick = () => {
          removeSuggestions();
          input.value = 'What services do you offer?';
          input.dispatchEvent(new Event('input'));
          handleSend();
          scrollToBottom();
        };
      }
    }

    connectSuggestionsListeners();

    function removeSuggestions() {
      // Keep quick links sticky and permanently visible on top
    }

    let visitorId = localStorage.getItem('chatbox_visitor_id');
    if (!visitorId) {
      visitorId = 'vis_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('chatbox_visitor_id', visitorId);
    }

    let conversationId = localStorage.getItem('chatbox_conversation_id') || null;

    let chatMessages = [];
    try {
      chatMessages = JSON.parse(localStorage.getItem('chatbox_messages') || '[]');
    } catch (e) {
      chatMessages = [];
    }

    function saveMessage(sender, text, isBooking = false) {
      chatMessages.push({ sender, text, isBooking });
      localStorage.setItem('chatbox_messages', JSON.stringify(chatMessages));
    }

    function toggleChat() {
      const isOpen = windowDiv.classList.contains('active');
      if (isOpen) {
        windowDiv.classList.remove('active');
        launcher.classList.remove('open');
        localStorage.setItem('chatbox_is_open', 'false');
      } else {
        windowDiv.classList.add('active');
        launcher.classList.add('open');
        localStorage.setItem('chatbox_is_open', 'true');
        badge.style.display = 'none'; // Clear notifications when opened
        setTimeout(() => input.focus(), 150);
        scrollToBottom(true);
      }
    }

    launcher.onclick = toggleChat;

    minimizeBtn.onclick = toggleChat;

    closeX.onclick = toggleChat;

    const clearBtn = document.getElementById('chatbox-clear-btn');
    if (clearBtn) {
      clearBtn.onclick = () => {
        if (confirm('Would you like to clear this conversation history?')) {
          chatMessages = [];
          localStorage.removeItem('chatbox_messages');
          localStorage.removeItem('chatbox_conversation_id');
          localStorage.removeItem('chatbox_lead_submitted');
          localStorage.removeItem('chatbox_visitor_name');
          localStorage.removeItem('chatbox_visitor_email');
          localStorage.removeItem('chatbox_visitor_phone');
          visitorId = 'vis_' + Math.random().toString(36).substring(2, 10);
          localStorage.setItem('chatbox_visitor_id', visitorId);
          leadSubmitted = false;
          visitorName = '';
          visitorEmail = '';
          visitorPhone = '';
          conversationId = null;
          updateChatInputLock();

          // Clear chat bubble containers
          body.innerHTML = `
            <div class="chatbox-message-row bot">
              ${avatarImg.replace('chatbox-avatar', 'chatbox-message-avatar')}
              <div class="chatbox-message">${welcomeMessage}</div>
            </div>
          `;

          if (config.widgetSettings?.showLeadForm !== false) {
            appendLeadFormWidget(false);
          }

          // Re-render sticky horizontal suggestions bar
          const stickySuggestions = document.getElementById('chatbox-sticky-suggestions');
          if (stickySuggestions) {
            stickySuggestions.innerHTML = getSuggestionsHTML();
            connectSuggestionsListeners();
          }
          
          scrollToBottom(true);
        }
      };
    }

    // Auto-show Contact Details widget card after welcome message if conversation is fresh
    if (chatMessages.length === 0 && config.widgetSettings?.showLeadForm !== false) {
      setTimeout(() => {
        appendLeadFormWidget(false);
      }, 50);
    }

    // Restore Open State
    const chatboxIsOpen = localStorage.getItem('chatbox_is_open') === 'true';
    if (chatboxIsOpen) {
      windowDiv.classList.add('active');
      launcher.classList.add('open');
    }

    // Escape button to close dialog
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && windowDiv.classList.contains('active')) {
        toggleChat();
      }
    });

    window.chatboxSendQuery = function(queryText) {
      if (!queryText) return;
      const showLeadForm = config.widgetSettings?.showLeadForm !== false;
      if (showLeadForm && !leadSubmitted) {
        alert('Please submit your Contact Details (Full Name & Email Address) above before starting the chat.');
        updateChatInputLock();
        return;
      }
      const inputEl = document.getElementById('chatbox-input');
      const sendBtn = document.getElementById('chatbox-send-btn');
      if (inputEl) {
        inputEl.value = queryText;
        inputEl.dispatchEvent(new Event('input'));
        if (sendBtn) {
          sendBtn.disabled = false;
        }
      }
      if (typeof handleSend === 'function') {
        handleSend();
      } else if (sendBtn) {
        sendBtn.click();
      }
    };

    function formatMessageText(text) {
      if (!text) return '';

      // Extract Related Questions block and convert into interactive clickable pills
      let relatedQuestionsHtml = '';
      const relatedRegex = /(?:\*\*)?Related questions:?(?:\*\*)?\s*([\s\S]*?)(?=$|\n\n[^\n•*-✓]|\n\*\*)/i;
      const relatedMatch = text.match(relatedRegex);
      if (relatedMatch) {
        const rawBlock = relatedMatch[1];
        const lines = rawBlock.split('\n').map(l => l.trim()).filter(Boolean);
        let pillsHtml = '';
        let firstAttrQ = '';
        lines.forEach(line => {
          const cleanQ = line
            .replace(/^(?:•|\*|-|✓|&#10004;|\d+\.)\s*/, '')
            .replace(/\*\*/g, '')
            .replace(/^✓\s*/, '')
            .trim();
          if (cleanQ && cleanQ.length > 3 && !cleanQ.toLowerCase().includes('related questions')) {
            const attrQ = cleanQ.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            if (!firstAttrQ) firstAttrQ = attrQ;

            // Shorten pill label for clean, non-lengthy chatbox display
            let shortLabel = cleanQ
              .replace(/^(?:what is|what are|can you tell me|how do i|where can i find|tell me about|could you provide|do you have|please explain|how can i|what does|is there a|do you offer)\s+/gi, '')
              .trim();
            shortLabel = shortLabel.charAt(0).toUpperCase() + shortLabel.slice(1);
            if (shortLabel.length > 30) {
              shortLabel = shortLabel.substring(0, 28) + '...';
            }

            pillsHtml += `
              <button class="chatbox-related-pill" onclick="window.chatboxSendQuery('${attrQ}')" type="button" title="${attrQ}">
                <span class="chatbox-related-icon">✓</span>
                <span>${shortLabel}</span>
              </button>
            `;
          }
        });
        if (pillsHtml) {
          relatedQuestionsHtml = `
            <div class="chatbox-related-questions-box">
              <div class="chatbox-related-header" ${firstAttrQ ? `onclick="window.chatboxSendQuery('${firstAttrQ}')" style="cursor: pointer;"` : ''}>Related questions:</div>
              ${pillsHtml}
            </div>
          `;
          text = text.replace(relatedRegex, '');
        }
      }

      // Preprocess multi-line business hours format (e.g. "Monday\n9:00 AM to 4:00 PM") into "Monday: 9:00 AM to 4:00 PM"
      text = text.replace(/((?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday))\s*\n\s*((?:\d{1,2}:\d{2}|\d{1,2}\s*(?:AM|PM)|Closed|Unavailable).*?)(?=\n|$)/gi, '$1: $2');

      // Check if the response contains Business Working Hours
      if (text.includes('Business Working Hours') || text.includes('Business Hours') || text.includes('Working Hours')) {
        const lines = text.split('\n');
        let headerText = '';
        let footerText = '';
        let hoursHtml = '<div style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px; width: 100%; min-width: 220px; max-width: 280px; font-size: 12px; background: rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.06); padding: 12px; border-radius: 12px; box-sizing: border-box; font-family: inherit;">';
        let hasHours = false;

        lines.forEach(line => {
          // Matches format: "- Monday: 10:00 to 17:00" or "* **Monday**: 10:00 to 17:00" or "Monday: 10:00 to 17:00"
          const match = line.match(/(?:-|\*|\s)*\s*(?:\*\*)?([a-zA-Z]+)(?:\*\*)?:\s*(.*)/);
          if (match && ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(match[1].toLowerCase())) {
            hasHours = true;
            const day = match[1];
            const hours = match[2].trim();
            const isClosed = hours.toLowerCase().includes('closed') || hours.toLowerCase().includes('unavailable');
            
            hoursHtml += `
              <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 4px; border-b: 1px dashed rgba(0,0,0,0.05); width: 100%;">
                <span style="font-weight: 600; color: #475569;">${day}</span>
                <span style="font-weight: 600; color: ${isClosed ? '#ef4444' : '#10b981'}; background: ${isClosed ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)'}; padding: 3px 8px; border-radius: 20px; font-size: 11px;">
                  ${hours}
                </span>
              </div>
            `;
          } else if (line.trim()) {
            let cleanLine = line
              .replace(/^[\s\-\*\•]+/, '')
              .replace(/\*\*/g, '')
              .trim();

            // Shorten titles like "Official Business Working Hours" or "Official Dashboard Business Working Hours" to "Business Hours"
            if (cleanLine.toLowerCase().includes('business') && cleanLine.toLowerCase().includes('hours')) {
              cleanLine = cleanLine.replace(/(?:Official\s*|Dashboard\s*)?Business\s*Working\s*Hours/gi, 'Business Hours');
            }

            if (!hasHours) {
              const lineLower = cleanLine.toLowerCase().replace(/\s+/g, '');
              const isPreambleExcluded = 
                lineLower.includes('oursupportteamisavailable') ||
                lineLower.includes('supportteamisavailable') ||
                lineLower.includes('availableduringthefollowinghours');

              if (!isPreambleExcluded) {
                headerText += (headerText ? '<br/>' : '') + cleanLine;
              }
            } else {
              // Exclude typical footer notes like "If you need to get in touch outside of these hours..." or shopping cart boilerplate
              const lineLower = cleanLine.toLowerCase().replace(/\s+/g, '');
              const isExcluded = 
                lineLower.includes('outsideofthesehours') || 
                lineLower.includes('leaveamessage') || 
                lineLower.includes('nextworkingday') || 
                lineLower.includes('getbacktoyou') || 
                cleanLine.includes('Cart') || 
                cleanLine.includes('Jeans') || 
                cleanLine.includes('WP DESGIN') || 
                cleanLine.includes('Close cart');

              if (!isExcluded) {
                footerText += (footerText ? '<br/>' : '') + cleanLine;
              }
            }
          }
        });
        hoursHtml += '</div>';

        if (hasHours) {
          if (!headerText || headerText.includes('Business Hours') || headerText.includes('Working Hours')) {
            headerText = 'Business Hours';
          }
          return `<div style="font-weight: 600; font-size: 14px; margin-bottom: 6px; color: #0f172a;">${headerText}</div>${hoursHtml}${footerText ? `<div style="margin-top: 10px; font-size: 12px; color: #64748b;">${footerText}</div>` : ''}${relatedQuestionsHtml}`;
        }
      }

      let escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

      // Strip out any trailing Sources: blocks
      escaped = escaped.replace(/(?:\n)*\s*(?:\*\*)?Sources?:?(?:\*\*)?[\s\S]*$/gi, '');

      // Auto-bold standard section headings like Call Us, Visit or Write to Us, Online Enquiry
      escaped = escaped.replace(/(^|\n)(Call Us|Visit or Write to Us|Online Enquiry|Contact Us|Email Us|Office Location|Headquarters)(?::)?(?=\n|$)/gi, '$1<strong>$2</strong>');

      // Convert markdown bold **text** to <strong>
      escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      // Convert markdown links [text](url) (supporting both absolute URLs and relative paths like /contact-us, /book-now)
      escaped = escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, linkUrl) => {
        const cleanLabel = label
          .replace(/Page$/i, ' Page')
          .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
          .trim();
        const isExternal = linkUrl.startsWith('http://') || linkUrl.startsWith('https://');
        return `<a href="${linkUrl}" ${isExternal ? 'target="_blank" rel="noopener"' : ''} class="chatbox-link">${cleanLabel}</a>`;
      });

      // Convert bullet points (•, *, -) to styled inline checkmark list items
      escaped = escaped.replace(/(?:^|\n)\s*(?:•|\*|-)\s*(.*?)(?=\n|$)/gi, (match, content) => {
        if (!content.trim()) return '';
        return `\n<div class="chatbox-list-item"><span class="chatbox-list-icon">✓</span><span>${content.trim()}</span></div>`;
      });

      // Handle 📌 Source tags cleanly without duplicating 'Source:'
      escaped = escaped.replace(/📌\s*(?:\*\*Source:\*\*|Source:)?\s*(.*)/g, `<div style="margin-top: 8px; font-size: 11px; color: #64748b; font-style: italic;">📌 <strong>Source:</strong> $1</div>`);
      
      // Convert raw URLs & Email addresses
      escaped = escaped.replace(/(^|[^"])((?:https?):\/\/[^\s<]+)/g, `$1<a href="$2" target="_blank" rel="noopener" class="chatbox-link">$2</a>`);
      escaped = escaped.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, `<a href="mailto:$1" class="chatbox-link">$1</a>`);

      // Convert phone numbers like 01 451 9717, +353 1 451 9717, +1 (800) 555-0199 into clickable tel links
      escaped = escaped.replace(/(^|[^0-9+])((?:0\d{1,3}[\s.-]?\d{3}[\s.-]?\d{3,4}|\+?\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}))(?=[^0-9+]|$)/g, (match, prefix, phoneNum) => {
        const cleanPhone = phoneNum.replace(/[^\d+]/g, '');
        if (cleanPhone.length >= 7) {
          return `${prefix}<a href="tel:${cleanPhone}" class="chatbox-link">📞 ${phoneNum.trim()}</a>`;
        }
        return match;
      });
      
      // Process newlines and strip extra breaks around list items
      escaped = escaped.replace(/\n/g, '<br/>');
      escaped = escaped.replace(/(?:<br\/>)*<div class="chatbox-list-item">/g, '<div class="chatbox-list-item">');
      escaped = escaped.replace(/<\/div>(?:<br\/>)+<div class="chatbox-list-item">/g, '</div><div class="chatbox-list-item">');
      escaped = escaped.replace(/<\/div>(?:<br\/>)+/g, '</div>');
      escaped = escaped.replace(/(?:<br\/>){3,}/g, '<br/><br/>');

      return escaped + relatedQuestionsHtml;
    }

    function appendMessage(sender, text, shouldSave = true) {
      const row = document.createElement('div');
      row.className = `chatbox-message-row ${sender}`;
      
      if (sender === 'bot') {
        row.innerHTML = `
          ${avatarImg.replace('chatbox-avatar', 'chatbox-message-avatar')}
          <div class="chatbox-message">${formatMessageText(text)}</div>
        `;
      } else {
        row.innerHTML = `
          <div class="chatbox-message">${formatMessageText(text)}</div>
        `;
      }
      
      body.appendChild(row);
      scrollToLatestIfNeeded();

      if (shouldSave) {
        saveMessage(sender, text, false);
      }
    }

    // Scroll monitoring implementation
    body.addEventListener('scroll', () => {
      const isNearBottom = body.scrollHeight - body.scrollTop - body.clientHeight < 120;
      if (isNearBottom) {
        scrollLatestBtn.classList.remove('visible');
      } else {
        // Only show if content height is larger than view height
        if (body.scrollHeight > body.clientHeight) {
          scrollLatestBtn.classList.add('visible');
        }
      }
    });

    // Intercept mouse wheel scrolling over chatbox to scroll chat messages fast & smooth
    body.addEventListener('wheel', (e) => {
      const isScrollable = body.scrollHeight > body.clientHeight;
      if (!isScrollable) return;

      const delta = e.deltaY;
      const atTop = body.scrollTop <= 0;
      const atBottom = body.scrollTop + body.clientHeight >= body.scrollHeight - 2;

      if ((delta < 0 && !atTop) || (delta > 0 && !atBottom)) {
        e.preventDefault();
        e.stopPropagation();

        // 2.2x speed multiplier for fast, responsive mouse wheel scrolling
        const multiplier = 2.2;
        body.scrollTop += delta * multiplier;
      }
    }, { passive: false });

    windowDiv.addEventListener('wheel', (e) => {
      e.stopPropagation();
    }, { passive: true });

    scrollLatestBtn.onclick = () => {
      scrollToBottom(true);
    };

    function scrollToBottom(force = true) {
      requestAnimationFrame(() => {
        body.scrollTop = body.scrollHeight + 99999;
        scrollLatestBtn.classList.remove('visible');
      });
      setTimeout(() => {
        body.scrollTop = body.scrollHeight + 99999;
      }, 50);
    }

    function scrollToLatestIfNeeded() {
      const isNearBottom = body.scrollHeight - body.scrollTop - body.clientHeight < 250;
      if (isNearBottom || body.scrollTop === 0) {
        scrollToBottom(true);
      } else {
        scrollLatestBtn.classList.add('visible');
        badge.style.display = 'block'; // launcher notification
      }
    }

    // Appends the interactive booking wizard component directly inside the chat body
    function appendBookingWidget(shouldSave = true) {
      const wizardContainer = document.createElement('div');
      wizardContainer.className = 'chatbox-message-row bot booking-wizard-container';
      wizardContainer.style.maxWidth = '90%';
      
      const wizard = document.createElement('div');
      wizard.className = 'booking-wizard';
      wizardContainer.innerHTML = avatarImg.replace('chatbox-avatar', 'chatbox-message-avatar').replace('style="', 'style="align-self: flex-start; ');
      wizardContainer.appendChild(wizard);
      
      body.appendChild(wizardContainer);
      scrollToLatestIfNeeded();

      if (shouldSave) {
        saveMessage('bot', '[booking-flow]', true);
      }

      // Booking State
      let selectedService = null;
      let selectedDate = '';
      let selectedSlot = null;
      let clientDetails = { name: '', email: '', phone: '', notes: '' };

      renderStep1();

      // Step 1: Select Service
      function renderStep1() {
        wizard.innerHTML = `
          <div class="booking-skeleton"></div>
          <div class="booking-skeleton"></div>
        `;
        
        fetch(`${origin}/api/services?agentId=${agentId}&bookableOnly=true`)
          .then(res => res.json())
          .then((services) => {
            const activeServices = Array.isArray(services)
              ? services.filter(s => s.isActive && s.isBookingEnabled !== false)
              : [];
            
            if (activeServices.length === 0) {
              // Automatically switch to Business Hours appointment system!
              selectedService = {
                id: 'general_appointment',
                name: 'General Appointment',
                durationMinutes: 30,
                price: 0,
                currency: 'USD'
              };
              renderStep2();
              return;
            }
            
            wizard.innerHTML = `<h4>📅 Select Service</h4>`;
            activeServices.forEach(s => {
              const btn = document.createElement('button');
              btn.className = 'booking-btn';
              btn.innerHTML = `
                <strong style="color: #0f172a; font-size: 13.5px;">${s.name}</strong>
                <span style="font-size: 11.5px; color: #64748b; margin-top: 3px;">
                  ⏱️ ${s.durationMinutes} mins &bull; 💳 ${s.price > 0 ? `${s.currency === 'USD' ? '$' : s.currency} ${s.price}` : 'Free'}
                </span>
              `;
              btn.onclick = () => {
                selectedService = s;
                renderStep2();
              };
              wizard.appendChild(btn);
            });

            // Option to cancel / remove an existing booking
            const cancelOptionBtn = document.createElement('button');
            cancelOptionBtn.className = 'booking-btn';
            cancelOptionBtn.style.cssText = 'margin-top: 8px; background-color: #fff1f2; border-color: #fecdd3; color: #e11d48; text-align: center; justify-content: center; font-size: 12px; font-weight: 500;';
            cancelOptionBtn.innerHTML = `🗑️ Cancel or Remove Existing Booking`;
            cancelOptionBtn.onclick = renderManageBooking;
            wizard.appendChild(cancelOptionBtn);

            scrollToLatestIfNeeded();
          })
          .catch(() => {
            // Fallback automatically to Business Hours appointment system
            selectedService = {
              id: 'general_appointment',
              name: 'General Appointment',
              durationMinutes: 30,
              price: 0,
              currency: 'USD'
            };
            renderStep2();
          });
      }

      // Step 2: Select Date (Visual Mini-Calendar with Real-Time Business Hours Availability)
      function renderStep2() {
        let currentCalDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
        if (isNaN(currentCalDate.getTime())) currentCalDate = new Date();
        
        wizard.innerHTML = `
          <h4>📅 Select Date</h4>
          <div class="booking-skeleton" style="height: 180px;"></div>
        `;
        scrollToLatestIfNeeded();

        Promise.all([
          fetch(`${origin}/api/business-hours?agentId=${agentId}`).then(r => r.json()).catch(() => []),
          fetch(`${origin}/api/holidays?agentId=${agentId}`).then(r => r.json()).catch(() => [])
        ])
          .then(([businessHours, holidays]) => {
            const enabledDays = new Set();
            if (Array.isArray(businessHours) && businessHours.length > 0) {
              businessHours.forEach(bh => {
                if (bh.isEnabled) {
                  enabledDays.add(bh.dayOfWeek); // 0 = Sunday, 1 = Monday, ...
                }
              });
            } else {
              [1, 2, 3, 4, 5].forEach(d => enabledDays.add(d));
            }

            const holidayMap = new Map();
            if (Array.isArray(holidays)) {
              holidays.forEach(h => holidayMap.set(h.date, h.name));
            }

            function renderCalendarView(year, month) {
              const firstDay = new Date(year, month, 1);
              const lastDay = new Date(year, month + 1, 0);
              const monthName = firstDay.toLocaleString('default', { month: 'long' });
              
              const startDayOfWeek = firstDay.getDay(); // 0 = Sun
              const totalDays = lastDay.getDate();
              const today = new Date();
              today.setHours(0,0,0,0);

              let calHtml = `
                <h4>📅 Select Date</h4>
                <div class="booking-calendar-header">
                  <button class="booking-calendar-nav" id="cal-prev" type="button">&lt;</button>
                  <span class="booking-calendar-title">${monthName} ${year}</span>
                  <button class="booking-calendar-nav" id="cal-next" type="button">&gt;</button>
                </div>
                <div class="booking-calendar-grid">
                  <div class="booking-calendar-day-header">Su</div>
                  <div class="booking-calendar-day-header">Mo</div>
                  <div class="booking-calendar-day-header">Tu</div>
                  <div class="booking-calendar-day-header">We</div>
                  <div class="booking-calendar-day-header">Th</div>
                  <div class="booking-calendar-day-header">Fr</div>
                  <div class="booking-calendar-day-header">Sa</div>
              `;

              // Offset blanks for starting day of month
              for (let i = 0; i < startDayOfWeek; i++) {
                calHtml += `<div class="booking-calendar-cell disabled"></div>`;
              }

              for (let d = 1; d <= totalDays; d++) {
                const dateObj = new Date(year, month, d);
                dateObj.setHours(0,0,0,0);
                const dayOfWeek = dateObj.getDay();

                const dateISO = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

                const isPast = dateObj.getTime() < today.getTime();
                const isOpenDay = enabledDays.has(dayOfWeek);
                const holidayName = holidayMap.get(dateISO);
                const isSelected = dateISO === selectedDate;

                if (holidayName) {
                  calHtml += `<div class="booking-calendar-cell disabled" style="background: #fff7ed !important; color: #c2410c !important; border-color: #ffedd5 !important;" title="Holiday: ${holidayName}">${d}</div>`;
                } else if (isPast || !isOpenDay) {
                  calHtml += `<div class="booking-calendar-cell disabled" title="${!isOpenDay ? 'Closed / Unavailable' : 'Past date'}">${d}</div>`;
                } else {
                  calHtml += `<div class="booking-calendar-cell available ${isSelected ? 'selected' : ''}" data-date="${dateISO}" title="Available">${d}</div>`;
                }
              }

              calHtml += `</div>
                <div style="font-size: 11px; color: #64748b; text-align: center; margin-top: 4px; font-weight: 500;">
                  🟢 Green dates = Business Hours &bull; 🟧 Holiday
                </div>
              `;

              wizard.innerHTML = calHtml;

              wizard.querySelector('#cal-prev').onclick = () => {
                currentCalDate.setMonth(currentCalDate.getMonth() - 1);
                renderCalendarView(currentCalDate.getFullYear(), currentCalDate.getMonth());
              };

              wizard.querySelector('#cal-next').onclick = () => {
                currentCalDate.setMonth(currentCalDate.getMonth() + 1);
                renderCalendarView(currentCalDate.getFullYear(), currentCalDate.getMonth());
              };

              wizard.querySelectorAll('.booking-calendar-cell.available').forEach(cell => {
                cell.onclick = () => {
                  selectedDate = cell.getAttribute('data-date');
                  renderStep3();
                };
              });

              scrollToLatestIfNeeded();
            }

            renderCalendarView(currentCalDate.getFullYear(), currentCalDate.getMonth());
          })
          .catch(() => {
            const todayStr = new Date().toISOString().split('T')[0];
            wizard.innerHTML = `
              <h4>📅 Select Date</h4>
              <label class="booking-label">Choose appointment date</label>
              <input type="date" min="${todayStr}" id="booking-date-picker" class="booking-input" value="${selectedDate || ''}" />
              <button id="booking-date-next" class="booking-btn booking-btn-primary" style="margin-top: 6px;">Check Available Times</button>
            `;
            wizard.querySelector('#booking-date-next').onclick = () => {
              const datePicker = wizard.querySelector('#booking-date-picker');
              if (!datePicker.value) { alert('Please select a date.'); return; }
              selectedDate = datePicker.value;
              renderStep3();
            };
          });
      }

      // Step 3: Select Time Slots
      function renderStep3() {
        wizard.innerHTML = `
          <h4>Select Time</h4>
          <div class="booking-skeleton" style="height: 30px;"></div>
          <div class="booking-skeleton" style="height: 30px;"></div>
        `;
        scrollToLatestIfNeeded();

        fetch(`${origin}/api/bookings/available-slots?agentId=${agentId}&serviceId=${selectedService.id}&date=${selectedDate}`)
          .then(res => res.json())
          .then((slots) => {
            if (!Array.isArray(slots) || slots.length === 0) {
              const dateParts = selectedDate.split('-').map(Number);
              const currD = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
              currD.setDate(currD.getDate() + 1);
              const nextDateISO = `${currD.getFullYear()}-${String(currD.getMonth() + 1).padStart(2, '0')}-${String(currD.getDate()).padStart(2, '0')}`;

              wizard.innerHTML = `
                <h4>Select Time</h4>
                <div style="font-size: 12.5px; color: #475569; margin-bottom: 12px; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; line-height: 1.4;">
                  No remaining slots available for <strong>${selectedDate}</strong> (working hours may have passed or day is closed).
                </div>
                <div style="display: flex; gap: 8px;">
                  <button id="booking-slot-back" class="booking-btn" style="flex:1; text-align:center; justify-content:center; margin-bottom:0; font-weight:600; color:#0f172a !important;">Choose Date</button>
                  <button id="booking-slot-next" class="booking-btn booking-btn-primary" style="flex:1; margin-bottom:0;">Try Tomorrow (${nextDateISO})</button>
                </div>
              `;
              wizard.querySelector('#booking-slot-back').onclick = renderStep2;
              wizard.querySelector('#booking-slot-next').onclick = () => {
                selectedDate = nextDateISO;
                renderStep3();
              };
              return;
            }

            wizard.innerHTML = `
              <h4>Select Time</h4>
              <div style="font-size: 12px; color: #64748b;">Available times on ${selectedDate}:</div>
              <div class="booking-grid" id="slots-grid"></div>
              <button id="booking-slot-back" class="booking-btn" style="margin-top: 12px; text-align:center; justify-content:center; margin-bottom: 0; font-weight:600; color:#0f172a !important;">Back to Dates</button>
            `;

            const grid = wizard.querySelector('#slots-grid');
            slots.forEach(slot => {
              const pill = document.createElement('div');
              const isSelectedSlot = selectedSlot && selectedSlot.startTime === slot.startTime;
              pill.className = `booking-grid-item ${isSelectedSlot ? 'selected' : ''}`;
              pill.innerText = slot.localStart;
              pill.onclick = () => {
                selectedSlot = slot;
                renderStep4();
              };
              grid.appendChild(pill);
            });

            wizard.querySelector('#booking-slot-back').onclick = renderStep2;
            scrollToLatestIfNeeded();
          })
          .catch(() => {
            wizard.innerHTML = `
              <h4>Select Time</h4>
              <div style="font-size: 12.5px; color: #ef4444; margin-bottom: 12px;">Failed to verify slots.</div>
              <button id="booking-slot-back" class="booking-btn booking-btn-primary">Try Again</button>
            `;
            wizard.querySelector('#booking-slot-back').onclick = renderStep2;
          });
      }

      // Step 4: Collect Contact Details
      function renderStep4() {
        wizard.innerHTML = `
          <h4>Contact Details</h4>
          <label class="booking-label">Full Name *</label>
          <input type="text" id="booking-name" class="booking-input" required placeholder="John Smith" />
          
          <label class="booking-label">Email Address *</label>
          <input type="email" id="booking-email" class="booking-input" required placeholder="john@example.com" />
          
          <label class="booking-label">Phone Number</label>
          <input type="tel" id="booking-phone" class="booking-input" placeholder="+1 555-0199" />
          
          <label class="booking-label">Notes (Optional)</label>
          <textarea id="booking-notes" class="booking-input booking-textarea" rows="2" placeholder="Any details or special requests..."></textarea>
          
          <div style="display: flex; gap: 8px; margin-top: 8px;">
            <button id="booking-details-back" class="booking-btn" style="margin-bottom:0; flex:1; text-align:center; justify-content:center;">Back</button>
            <button id="booking-details-next" class="booking-btn booking-btn-primary" style="margin-bottom:0; flex:1;">Next</button>
          </div>
        `;

        // Prepopulate values if any
        wizard.querySelector('#booking-name').value = clientDetails.name;
        wizard.querySelector('#booking-email').value = clientDetails.email;
        wizard.querySelector('#booking-phone').value = clientDetails.phone;
        
        const notesArea = wizard.querySelector('#booking-notes');
        notesArea.value = clientDetails.notes;

        const autoExpandNotes = () => {
          notesArea.style.height = 'auto';
          notesArea.style.height = Math.max(48, notesArea.scrollHeight) + 'px';
        };
        notesArea.oninput = autoExpandNotes;
        setTimeout(autoExpandNotes, 0);

        wizard.querySelector('#booking-details-back').onclick = () => {
          clientDetails = {
            name: wizard.querySelector('#booking-name').value.trim(),
            email: wizard.querySelector('#booking-email').value.trim(),
            phone: wizard.querySelector('#booking-phone').value.trim(),
            notes: wizard.querySelector('#booking-notes').value.trim()
          };
          renderStep3();
        };

        wizard.querySelector('#booking-details-next').onclick = () => {
          const nameVal = wizard.querySelector('#booking-name').value.trim();
          const emailVal = wizard.querySelector('#booking-email').value.trim();
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          
          if (!nameVal) {
            alert('Please enter your Full Name.');
            return;
          }
          if (!emailVal || !emailRegex.test(emailVal)) {
            alert('Please enter a valid email address.');
            return;
          }
          
          clientDetails = {
            name: nameVal,
            email: emailVal,
            phone: wizard.querySelector('#booking-phone').value.trim(),
            notes: wizard.querySelector('#booking-notes').value.trim()
          };
          renderStep5();
        };
        scrollToLatestIfNeeded();
      }

      // Step 5: Summary & Confirm
      function renderStep5() {
        wizard.innerHTML = `
          <h4>Confirm Booking</h4>
          <div style="margin-bottom:14px; background-color: #f8fafc; border-radius: 12px; padding: 12px; border: 1px dashed #e2e8f0;">
            <div class="booking-summary-row">
              <span class="booking-summary-label">Service:</span>
              <span class="booking-summary-val">${selectedService.name}</span>
            </div>
            <div class="booking-summary-row">
              <span class="booking-summary-label">Date:</span>
              <span class="booking-summary-val">${selectedDate}</span>
            </div>
            <div class="booking-summary-row">
              <span class="booking-summary-label">Time:</span>
              <span class="booking-summary-val">${selectedSlot.localStart}</span>
            </div>
            <div class="booking-summary-row">
              <span class="booking-summary-label">Client:</span>
              <span class="booking-summary-val">${clientDetails.name}</span>
            </div>
            <div class="booking-summary-row" style="border-bottom: none; padding-bottom: 0;">
              <span class="booking-summary-label">Email:</span>
              <span class="booking-summary-val" style="font-size:11.5px; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${clientDetails.email}</span>
            </div>
          </div>
          
          <div style="display: flex; gap: 8px;">
            <button id="booking-confirm-back" class="booking-btn" style="margin-bottom:0; flex:1; text-align:center; justify-content:center;">Back</button>
            <button id="booking-confirm-submit" class="booking-btn booking-btn-primary" style="margin-bottom:0; flex:1;">Book Now</button>
          </div>
        `;

        wizard.querySelector('#booking-confirm-back').onclick = renderStep4;
        
        const submitBtn = wizard.querySelector('#booking-confirm-submit');
        submitBtn.onclick = () => {
          submitBtn.disabled = true;
          submitBtn.innerText = 'Booking...';

          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

          fetch(`${origin}/api/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              agentId,
              serviceId: selectedService.id,
              customerName: clientDetails.name,
              customerEmail: clientDetails.email,
              customerPhone: clientDetails.phone,
              customerNotes: clientDetails.notes,
              startTime: selectedSlot.startTime,
              endTime: selectedSlot.endTime,
              timezone: tz
            })
          })
          .then(res => {
            if (res.ok) return res.json();
            return res.json().then(d => { throw new Error(d.error || 'Failed to complete booking') });
          })
          .then((result) => {
            renderSuccess(result.booking);
          })
          .catch((err) => {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Book Now';
            alert(err.message || 'Error executing booking.');
          });
        };
        scrollToLatestIfNeeded();
      }

      // Success screen
      function renderSuccess(booking) {
        wizard.innerHTML = `
          <h4 style="color: #d97706; display:flex; align-items:center; gap:6px;">
            ⌛ Booking Pending Approval
          </h4>
          <div style="font-size:13px; color:#64748b; line-height:1.4; margin-bottom:12px;">
            Your appointment request has been submitted and is currently <strong>pending administrator approval</strong>. Once approved by our team in the dashboard, a confirmation email will be sent to <strong>${clientDetails.email || booking.customerEmail || 'your email'}</strong>.
          </div>
          <div style="font-size:12px; background-color:#fffbeb; border: 1px solid #fde68a; border-radius:10px; padding:12px; line-height: 1.6; margin-bottom: 12px;">
            <strong>Status:</strong> <span style="display:inline-block; padding:2px 8px; border-radius:12px; background-color:#fef3c7; color:#b45309; font-weight:600; font-size:11px;">⌛ Pending Admin Approval</span><br/>
            <strong>Confirmation ID:</strong> <span style="font-family:monospace; color:${primaryColor};">${booking.id}</span><br/>
            <strong>Service:</strong> ${booking.serviceName}<br/>
            <strong>Business:</strong> ${booking.businessName}<br/>
            <strong>Time:</strong> ${selectedDate} at ${selectedSlot ? selectedSlot.localStart : ''}
          </div>
          <button id="booking-cancel-btn" class="booking-btn" style="margin-bottom:0; background-color:#fff1f2; color:#e11d48; border-color:#fecdd3; text-align:center; justify-content:center;">
            🗑️ Delete / Cancel Booking Request
          </button>
        `;

        wizard.querySelector('#booking-cancel-btn').onclick = () => {
          if (!confirm('Are you sure you want to delete this booking?')) return;
          const cancelBtn = wizard.querySelector('#booking-cancel-btn');
          cancelBtn.disabled = true;
          cancelBtn.innerText = 'Deleting...';

          fetch(`${origin}/api/bookings?id=${booking.id}&customerEmail=${encodeURIComponent(clientDetails.email)}`, {
            method: 'DELETE'
          })
          .then(res => {
            if (res.ok) {
              wizard.innerHTML = `
                <h4 style="color: #ef4444; display:flex; align-items:center; gap:6px;">
                  🗑️ Booking Deleted
                </h4>
                <div style="font-size:13px; color:#64748b; line-height:1.4;">
                  Your booking (ID: <code style="font-family:monospace;">${booking.id}</code>) has been successfully deleted and removed from the schedule.
                </div>
              `;
            } else {
              return res.json().then(d => { throw new Error(d.error || 'Failed to delete booking') });
            }
          })
          .catch(err => {
            cancelBtn.disabled = false;
            cancelBtn.innerText = '🗑️ Delete / Cancel Booking';
            alert(err.message || 'Error deleting booking');
          });
        };
        scrollToLatestIfNeeded();
      }

      // Manage / Cancel Existing Booking screen
      function renderManageBooking() {
        wizard.innerHTML = `
          <h4>🗑️ Cancel / Delete Booking</h4>
          <label class="booking-label">Booking Confirmation ID *</label>
          <input type="text" id="manage-booking-id" class="booking-input" placeholder="e.g. cm78xyz..." required />
          
          <label class="booking-label">Your Email Address *</label>
          <input type="email" id="manage-booking-email" class="booking-input" placeholder="john@example.com" required />
          
          <div style="display: flex; gap: 8px; margin-top: 8px;">
            <button id="manage-booking-back" class="booking-btn" style="margin-bottom:0; flex:1; text-align:center; justify-content:center;">Back</button>
            <button id="manage-booking-submit" class="booking-btn" style="margin-bottom:0; flex:1; background-color:#ef4444; color:white; border:none; text-align:center; justify-content:center; font-weight:600;">Delete Booking</button>
          </div>
        `;

        wizard.querySelector('#manage-booking-back').onclick = renderStep1;

        const deleteBtn = wizard.querySelector('#manage-booking-submit');
        deleteBtn.onclick = () => {
          const bId = wizard.querySelector('#manage-booking-id').value.trim();
          const emailVal = wizard.querySelector('#manage-booking-email').value.trim();

          if (!bId || !emailVal) {
            alert('Booking ID and Email Address are required.');
            return;
          }

          if (!confirm('Are you sure you want to permanently delete this booking?')) return;

          deleteBtn.disabled = true;
          deleteBtn.innerText = 'Deleting...';

          fetch(`${origin}/api/bookings?id=${encodeURIComponent(bId)}&customerEmail=${encodeURIComponent(emailVal)}`, {
            method: 'DELETE'
          })
          .then(res => {
            if (res.ok) {
              wizard.innerHTML = `
                <h4 style="color: #ef4444; display:flex; align-items:center; gap:6px;">
                  🗑️ Booking Deleted
                </h4>
                <div style="font-size:13px; color:#64748b; line-height:1.4;">
                  Booking <strong>${bId}</strong> has been successfully cancelled and removed from the system.
                </div>
              `;
            } else {
              return res.json().then(d => { throw new Error(d.error || 'Booking not found or details do not match') });
            }
          })
          .catch(err => {
            deleteBtn.disabled = false;
            deleteBtn.innerText = 'Delete Booking';
            alert(err.message || 'Error deleting booking.');
          });
        };
        scrollToLatestIfNeeded();
      }
    }

    function appendLeadFormWidget(shouldSave = true) {
      const wizardContainer = document.createElement('div');
      wizardContainer.className = 'chatbox-message-row bot booking-wizard-container';
      wizardContainer.style.maxWidth = '90%';
      
      const wizard = document.createElement('div');
      wizard.className = 'booking-wizard';
      wizardContainer.innerHTML = avatarImg.replace('chatbox-avatar', 'chatbox-message-avatar').replace('style="', 'style="align-self: flex-start; ');
      wizardContainer.appendChild(wizard);
      
      body.appendChild(wizardContainer);
      scrollToLatestIfNeeded();

      if (shouldSave) {
        saveMessage('bot', '[lead-form]', true);
      }

      wizard.innerHTML = `
        <h4 style="display:flex; align-items:center; gap:6px; margin-bottom: 8px;">📋 Contact Details</h4>
        <div style="font-size: 12.5px; color: #475569; margin-bottom: 12px; line-height: 1.4;">
          Please leave your contact details below to unlock the chat:
        </div>
        
        <label class="booking-label">Full Name *</label>
        <input type="text" id="lead-name" class="booking-input" placeholder="John Smith" />
        
        <label class="booking-label">Email Address *</label>
        <input type="email" id="lead-email" class="booking-input" required placeholder="john@example.com" />
        
        <label class="booking-label">Phone Number *</label>
        <input type="tel" id="lead-phone" class="booking-input" placeholder="+1 (555) 000-0000" />

        <button id="lead-submit-btn" class="booking-btn booking-btn-primary" style="margin-top: 10px;">Submit Contact Details</button>
        
        <div style="margin-top: 12px; padding: 10px; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; color: #3b82f6; font-size: 12.5px; display: flex; align-items: center; gap: 8px; font-weight: 500;">
          <span style="font-size:15px; line-height: 1;">👋</span>
          We'd love to know who we're talking to! Submit your details to unlock the chat.
        </div>
      `;

      const submitBtn = wizard.querySelector('#lead-submit-btn');
      if (!submitBtn) return;
      submitBtn.onclick = () => {
        const nameVal = wizard.querySelector('#lead-name').value.trim();
        const emailVal = wizard.querySelector('#lead-email').value.trim();
        const phoneVal = wizard.querySelector('#lead-phone').value.trim();

        if (!nameVal) {
          alert('Please enter your Full Name.');
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailVal || !emailRegex.test(emailVal)) {
          alert('Please enter a valid Email Address.');
          return;
        }

        if (!phoneVal) {
          alert('Please enter your Phone Number.');
          return;
        }

        submitBtn.disabled = true;
        submitBtn.innerText = 'Saving Lead...';

        fetch(`${origin}/api/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId,
            conversationId,
            name: nameVal,
            email: emailVal,
            phone: phoneVal
          })
        })
        .then(res => {
          if (res.ok) return res.json();
          return res.json().then(d => { throw new Error(d.error || 'Failed to save contact details') });
        })
        .then(() => {
          localStorage.setItem('chatbox_lead_submitted', 'true');
          if (nameVal) localStorage.setItem('chatbox_visitor_name', nameVal);
          if (emailVal) localStorage.setItem('chatbox_visitor_email', emailVal);
          if (phoneVal) localStorage.setItem('chatbox_visitor_phone', phoneVal);
          leadSubmitted = true;
          visitorName = nameVal;
          visitorEmail = emailVal;
          visitorPhone = phoneVal;

          updateChatInputLock();

          wizard.innerHTML = `
            <h4 style="color: #10b981; display:flex; align-items:center; gap:6px; margin-bottom: 6px;">
              <svg style="width:18px;height:18px;fill:#10b981;" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
              Contact Details Received!
            </h4>
            <div style="font-size: 13px; color: #334155; line-height: 1.5; space-y-2;">
              <p style="margin: 0 0 8px 0;">Hello <strong>${nameVal}</strong>! Welcome to Geekvista. I'm the AI assistant here, and I'm happy to help you with any questions you might have about our services, pricing, or anything else related to our platform.</p>
              <p style="margin: 0 0 8px 0;">Whether you're looking to build a chatbot, explore our plans, or just need some support, feel free to ask and I'll do my best to assist you.</p>
              <p style="margin: 0; font-weight: 600; color: #0f172a;">What can I help you with today?</p>
            </div>
          `;
        })
        .catch((err) => {
          submitBtn.disabled = false;
          submitBtn.innerText = 'Submit Contact Details';
          alert(err.message || 'Failed to save contact details. Please try again.');
        });
      };
      scrollToLatestIfNeeded();
    }

    function appendTripFormWidget(shouldSave = true) {
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'chatbox-message-row bot booking-wizard-container';
      widgetContainer.style.maxWidth = '92%';

      const form = document.createElement('div');
      form.className = 'booking-wizard';
      form.innerHTML = `
        <h4 style="margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
          <span>🚘</span> Please Enter Trip Details
        </h4>
        <p style="font-size: 11.5px; color: #64748b; margin-bottom: 12px; margin-top: 0; line-height: 1.4;">Fill out your trip preferences below and our team will assist you promptly.</p>
        
        <div style="display: flex; gap: 8px;">
          <div style="flex: 1;">
            <label class="booking-label">First Name *</label>
            <input type="text" id="trip-first-name" class="booking-input" required placeholder="First Name" />
          </div>
          <div style="flex: 1;">
            <label class="booking-label">Last Name *</label>
            <input type="text" id="trip-last-name" class="booking-input" required placeholder="Last Name" />
          </div>
        </div>

        <label class="booking-label">Company</label>
        <input type="text" id="trip-company" class="booking-input" placeholder="Company (Optional)" />

        <label class="booking-label">Phone *</label>
        <input type="tel" id="trip-phone" class="booking-input" required placeholder="Phone Number" />

        <label class="booking-label">Choose Your Required Service: *</label>
        <select id="trip-service-type" class="booking-input" style="font-weight: 500; cursor: pointer;">
          <option value="Airport Transfer">Airport Transfer</option>
          <option value="Point-To-Point Transfer">Point-To-Point Transfer</option>
          <option value="Multi-Stop Road Show">Multi-Stop Road Show</option>
          <option value="Airport Meet&Greet Services">Airport Meet&Greet Services</option>
          <option value="Other Inquiries">Other Inquiries</option>
        </select>

        <label class="booking-label">Email *</label>
        <input type="email" id="trip-email" class="booking-input" required placeholder="Email Address" />

        <label class="booking-label">Additional Message</label>
        <textarea id="trip-message" class="booking-input booking-textarea" rows="2" placeholder="Additional details or specific instructions..."></textarea>

        <button id="trip-submit-btn" class="booking-btn booking-btn-primary" style="margin-top: 6px; margin-bottom: 0;">Submit Trip Request</button>
      `;

      widgetContainer.innerHTML = avatarImg.replace('chatbox-avatar', 'chatbox-message-avatar').replace('style="', 'style="align-self: flex-start; ');
      widgetContainer.appendChild(form);

      body.appendChild(widgetContainer);
      scrollToLatestIfNeeded();

      if (shouldSave) {
        saveMessage('bot', '[trip-form]', true);
      }

      // Auto-expanding textarea for Additional Message
      const msgArea = form.querySelector('#trip-message');
      if (msgArea) {
        const autoExpandMsg = () => {
          msgArea.style.height = 'auto';
          msgArea.style.height = Math.max(48, msgArea.scrollHeight) + 'px';
        };
        msgArea.oninput = autoExpandMsg;
      }

      // Submit Handler
      form.querySelector('#trip-submit-btn').onclick = () => {
        const firstName = form.querySelector('#trip-first-name').value.trim();
        const lastName = form.querySelector('#trip-last-name').value.trim();
        const company = form.querySelector('#trip-company').value.trim();
        const phone = form.querySelector('#trip-phone').value.trim();
        const serviceType = form.querySelector('#trip-service-type').value;
        const email = form.querySelector('#trip-email').value.trim();
        const message = form.querySelector('#trip-message').value.trim();

        if (!firstName) {
          alert('Please enter your First Name.');
          form.querySelector('#trip-first-name').focus();
          return;
        }
        if (!lastName) {
          alert('Please enter your Last Name.');
          form.querySelector('#trip-last-name').focus();
          return;
        }
        if (!phone) {
          alert('Phone * - Please fill out this field.');
          form.querySelector('#trip-phone').focus();
          return;
        }
        if (!email) {
          alert('Please enter your Email Address.');
          form.querySelector('#trip-email').focus();
          return;
        }

        const submitBtn = form.querySelector('#trip-submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerText = 'Submitting...';

        fetch(`${origin}/api/trip-inquiries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId,
            firstName,
            lastName,
            company,
            phone,
            serviceType,
            email,
            message,
          }),
        })
          .then(r => r.json())
          .then(data => {
            if (data.success) {
              form.innerHTML = `
                <div style="text-align: center; padding: 14px 6px;">
                  <div style="font-size: 28px; margin-bottom: 6px;">✅</div>
                  <strong style="color: #0f172a; font-size: 14px;">Trip Details Received!</strong>
                  <p style="font-size: 12px; color: #64748b; margin-top: 6px; margin-bottom: 0; line-height: 1.4;">
                    Thank you, <strong>${firstName}</strong>! Your trip request for <strong>${serviceType}</strong> has been received. Our team will contact you shortly.
                  </p>
                </div>
              `;
              scrollToLatestIfNeeded();
            } else {
              alert(data.error || 'Failed to submit trip details.');
              submitBtn.disabled = false;
              submitBtn.innerText = 'Submit Trip Request';
            }
          })
          .catch(() => {
            alert('Error submitting trip details. Please try again.');
            submitBtn.disabled = false;
            submitBtn.innerText = 'Submit Trip Request';
          });
      };
      scrollToLatestIfNeeded();
    }

    async function handleSend() {
      const showLeadForm = config.widgetSettings?.showLeadForm !== false;
      if (showLeadForm && !leadSubmitted) {
        alert('Please submit your Contact Details (Full Name & Email Address) above before starting the chat.');
        updateChatInputLock();
        return;
      }

      const message = input.value.trim();
      if (!message) return;

      appendMessage('user', message);
      input.value = '';
      input.dispatchEvent(new Event('input')); // trigger auto resize back to original height
      
      // Disable inputs while generating
      input.disabled = true;
      sendBtn.disabled = true;

      const typingIndicatorRow = document.createElement('div');
      typingIndicatorRow.className = 'chatbox-message-row bot';
      typingIndicatorRow.innerHTML = `
        ${avatarImg.replace('chatbox-avatar', 'chatbox-message-avatar')}
        <div class="chatbox-message">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      `;
      body.appendChild(typingIndicatorRow);
      scrollToLatestIfNeeded();

      try {
        const response = await fetch(`${origin}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId,
            visitorId,
            message,
            conversationId,
            meta: {
              visitorName: visitorName || localStorage.getItem('chatbox_visitor_name') || '',
              visitorEmail: visitorEmail || localStorage.getItem('chatbox_visitor_email') || '',
              country: (function() {
                try {
                  var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
                  if (tz.indexOf('Karachi') !== -1 || tz.indexOf('Pakistan') !== -1) return 'Pakistan';
                  if (tz.indexOf('Kolkata') !== -1 || tz.indexOf('Calcutta') !== -1) return 'India';
                  if (tz.indexOf('London') !== -1) return 'United Kingdom';
                  if (tz.indexOf('Dubai') !== -1) return 'United Arab Emirates';
                  if (tz.indexOf('Riyadh') !== -1) return 'Saudi Arabia';
                  if (tz.indexOf('Dhaka') !== -1) return 'Bangladesh';
                  if (tz.indexOf('Tokyo') !== -1) return 'Japan';
                  if (tz.indexOf('Toronto') !== -1 || tz.indexOf('Vancouver') !== -1) return 'Canada';
                  if (tz.indexOf('Sydney') !== -1 || tz.indexOf('Melbourne') !== -1) return 'Australia';
                  if (tz.indexOf('New_York') !== -1 || tz.indexOf('Los_Angeles') !== -1 || tz.indexOf('Chicago') !== -1) return 'United States';

                  var lang = navigator.language || '';
                  if (lang.indexOf('-PK') !== -1) return 'Pakistan';
                  if (lang.indexOf('-IN') !== -1) return 'India';
                  if (lang.indexOf('-GB') !== -1) return 'United Kingdom';
                  if (lang.indexOf('-US') !== -1) return 'United States';

                  if (tz && tz.indexOf('/') !== -1) {
                    return tz.split('/')[1].replace(/_/g, ' ');
                  }
                } catch(e) {}
                return 'Pakistan';
              })(),
              browser: (function() {
                var ua = navigator.userAgent;
                if (ua.indexOf('Edg/') !== -1) return 'Edge';
                if (ua.indexOf('OPR/') !== -1 || ua.indexOf('Opera') !== -1) return 'Opera';
                if (ua.indexOf('Chrome/') !== -1) return 'Chrome';
                if (ua.indexOf('Firefox/') !== -1) return 'Firefox';
                if (ua.indexOf('Safari/') !== -1) return 'Safari';
                return 'Browser';
              })(),
              pageUrl: window.location.href,
            }
          }),
        });

        if (body.contains(typingIndicatorRow)) {
          body.removeChild(typingIndicatorRow);
        }

        if (!response.ok) {
          console.warn('Chat API returned non-200 status:', response.status);
        }

        const botMessageRow = document.createElement('div');
        botMessageRow.className = 'chatbox-message-row bot';
        botMessageRow.innerHTML = `
          ${avatarImg.replace('chatbox-avatar', 'chatbox-message-avatar')}
          <div class="chatbox-message streaming-cursor"></div>
        `;
        body.appendChild(botMessageRow);
        const botMessageEl = botMessageRow.querySelector('.chatbox-message');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullReply = '';
        let isBookingTriggered = false;

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            botMessageEl.classList.remove('streaming-cursor');
            if (fullReply && !isBookingTriggered) {
              saveMessage('bot', fullReply);
            }
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const data = JSON.parse(line);
              if (data.conversationId) {
                conversationId = data.conversationId;
                localStorage.setItem('chatbox_conversation_id', conversationId);
              }
              if (data.bookingTrigger) {
                if (body.contains(botMessageRow)) {
                  body.removeChild(botMessageRow);
                }
                appendBookingWidget();
                isBookingTriggered = true;
                break;
              }
              if (data.chunk && !isBookingTriggered) {
                fullReply += data.chunk;
                botMessageEl.innerHTML = formatMessageText(fullReply);
                scrollToBottom(true);
              }
            } catch (err) {
              console.error('Error parsing line:', err);
            }
          }
          if (isBookingTriggered) break;
        }

        if (!fullReply && !isBookingTriggered) {
          const currentName = visitorName || localStorage.getItem('chatbox_visitor_name') || '';
          const nameGreeting = currentName ? `Hello ${currentName}!` : `Hello!`;
          const fallbackText = `${nameGreeting} Welcome to Geekvista. I am happy to help you with any questions about our AI chatbot builder, pricing plans, integrations, or support!`;
          botMessageEl.innerHTML = formatMessageText(fallbackText);
          botMessageEl.classList.remove('streaming-cursor');
          saveMessage('bot', fallbackText);
        }
      } catch (err) {
        console.error('Chat error handled gracefully:', err);
        if (body.contains(typingIndicatorRow)) {
          body.removeChild(typingIndicatorRow);
        }
        const currentName = visitorName || localStorage.getItem('chatbox_visitor_name') || '';
        const nameGreeting = currentName ? `Hello ${currentName}!` : `Hello!`;
        const fallbackMsg = `${nameGreeting} Welcome to Geekvista. How can I help you today?`;
        appendMessage('bot', fallbackMsg);
        saveMessage('bot', fallbackMsg);
      } finally {
        input.disabled = false;
        input.focus();
        // Trigger resize & validate buttons
        input.dispatchEvent(new Event('input'));
      }
    }

    // Restore message history if exists
    if (chatMessages.length > 0) {
      body.innerHTML = '';
      chatMessages.forEach(msg => {
        if (msg.isBooking) {
          appendBookingWidget(false);
        } else if (msg.text === '[trip-form]') {
          appendTripFormWidget(false);
        } else {
          appendMessage(msg.sender, msg.text, false);
        }
      });
      // Remove welcome suggestions if conversation is active
      removeSuggestions();
    }

    sendBtn.onclick = handleSend;
    input.onkeydown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };
  }
})();

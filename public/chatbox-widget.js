/**
 * ChatBox AI Widget Core Embedded Script
 * Renders floating action buttons and loaded custom dialogs on external webpages.
 * Includes interactive booking system wizard flow.
 */
(function() {
  // 1. Extract agent configuration script attributes
  const currentScript = document.currentScript;
  const agentId = currentScript ? currentScript.getAttribute('data-agent-id') : null;
  const isDashboard = currentScript ? currentScript.getAttribute('data-dashboard') === 'true' : false;

  if (!agentId) {
    console.error('ChatBox AI Widget error: missing "data-agent-id" attribute on script element.');
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
      console.error('Failed to initialize ChatBox AI Widget:', err);
    });

  function buildWidget(config, origin) {
    // 3. Inject global style definitions
    const style = document.createElement('style');
    const primaryColor = config.widgetSettings?.primaryColor || '#2563eb';
    const borderRadius = config.widgetSettings?.borderRadius || '0.75rem';
    const welcomeMessage = config.widgetSettings?.welcomeMessage || 'Hi! How can I help you today?';
    const placeholder = config.widgetSettings?.placeholder || 'Type your message...';
    const position = config.widgetSettings?.position || 'bottom-right';

    style.innerHTML = `
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
        background-color: ${primaryColor};
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
        position: relative;
        pointer-events: auto;
        border: none;
        outline: none;
      }
      #chatbox-launcher:hover {
        transform: scale(1.06);
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);
      }
      #chatbox-launcher:active {
        transform: scale(0.95);
      }
      #chatbox-launcher .icon-svg {
        position: absolute;
        transition: transform 0.3s ease, opacity 0.3s ease;
        fill: none;
        stroke: white;
      }
      #chatbox-launcher .icon-close {
        opacity: 0;
        transform: rotate(-45deg) scale(0.6);
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
        display: none;
        opacity: 0;
        transform: translateY(20px) scale(0.95);
        width: ${config.widgetSettings?.width || '385px'};
        height: ${config.widgetSettings?.height || '590px'};
        background: #ffffff;
        border: 1px solid #f1f5f9;
        border-radius: ${borderRadius};
        box-shadow: 0 12px 40px -4px rgba(0, 0, 0, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.06);
        position: absolute;
        bottom: 78px;
        ${position === 'bottom-right' ? 'right: 0;' : 'left: 0;'}
        flex-direction: column;
        overflow: hidden;
        transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: auto;
      }
      #chatbox-window.active {
        display: flex;
        opacity: 1;
        transform: translateY(0) scale(1);
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
        background: transparent;
        border: none;
        color: #64748b;
        padding: 6px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s, color 0.2s;
      }
      .chatbox-header-btn:hover {
        background-color: #f1f5f9;
        color: #0f172a;
      }
      
      #chatbox-body {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        background-color: #f8fafc;
        display: flex;
        flex-direction: column;
        gap: 16px;
        scroll-behavior: smooth;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      #chatbox-body::-webkit-scrollbar {
        display: none;
      }
      
      /* Messages Styles */
      .chatbox-message-row {
        display: flex;
        gap: 8px;
        max-width: 85%;
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
      }
      .chatbox-message-row.user {
        align-self: flex-end;
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
      }
      .chatbox-message-row.bot .chatbox-message {
        background-color: #ffffff;
        color: #1e293b;
        border-bottom-left-radius: 4px;
        border: 1px solid #f1f5f9;
      }
      .chatbox-message-row.user .chatbox-message {
        background-color: ${primaryColor};
        color: #ffffff;
        border-bottom-right-radius: 4px;
      }
      
      #chatbox-sticky-suggestions {
        background-color: #ffffff;
        border-bottom: 1px solid #f1f5f9;
        padding: 10px 14px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        flex-shrink: 0;
      }
      
      .chatbox-suggestion-pill {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        color: #334155;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
        text-align: left;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        flex-shrink: 0;
        margin: 0 0 5px 0 !important;
      }
      .chatbox-suggestion-pill img.emoji {
        width: 14px !important;
        height: 14px !important;
        margin: 0 !important;
        display: inline-block !important;
        vertical-align: middle !important;
      }
      .chatbox-suggestion-pill:hover {
        background-color: ${primaryColor};
        color: #ffffff !important;
        border-color: ${primaryColor};
      }
      .chatbox-suggestion-pill:hover strong {
        color: #ffffff !important;
      }
      .chatbox-suggestion-pill strong {
        color: #334155;
        font-weight: 600;
        transition: color 0.2s;
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
      }
      .booking-wizard {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 16px;
        margin-top: 8px;
        font-size: 13px;
        color: #334155;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
      }
      .booking-wizard h4 {
        margin: 0 0 12px 0;
        font-size: 14.5px;
        font-weight: 600;
        color: #0f172a;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .booking-btn {
        width: 100%;
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        color: #334155;
        padding: 10px 14px;
        border-radius: 10px;
        margin-bottom: 8px;
        text-align: left;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
      }
      .booking-btn:hover {
        background-color: #f1f5f9;
        border-color: #cbd5e1;
        transform: translateY(-1px);
      }
      .booking-btn-primary {
        background-color: ${primaryColor};
        color: white;
        border: none;
        text-align: center;
        justify-content: center;
        font-weight: 600;
      }
      .booking-btn-primary:hover {
        background-color: ${primaryColor};
        opacity: 0.95;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px ${primaryColor}30;
      }
      .booking-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        margin-top: 10px;
        max-height: 140px;
        overflow-y: auto;
        padding-right: 4px;
      }
      .booking-grid-item {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        text-align: center;
        padding: 8px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        box-sizing: border-box;
        transition: all 0.2s;
      }
      .booking-grid-item:hover {
        background-color: ${primaryColor};
        color: white;
        border-color: ${primaryColor};
      }
      .booking-input {
        width: 100%;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 13px;
        margin-bottom: 12px;
        box-sizing: border-box;
        background-color: #ffffff !important;
        color: #1e293b !important;
        outline: none;
        transition: border-color 0.2s;
      }
      .booking-input:focus {
        border-color: ${primaryColor};
      }
      .booking-label {
        font-size: 10.5px;
        text-transform: uppercase;
        font-weight: 600;
        color: #64748b;
        margin-bottom: 6px;
        display: block;
        letter-spacing: 0.5px;
      }
      .booking-summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        border-bottom: 1px dashed #f1f5f9;
        padding-bottom: 6px;
        font-size: 12.5px;
      }
      .booking-summary-label {
        color: #64748b;
      }
      .booking-summary-val {
        font-weight: 600;
        color: #0f172a;
        text-align: right;
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
      const showPricing = config.widgetSettings?.showPricing === true;

      if (showBooking || showLeadForm || showServices || showHours || showPricing) {
        html += '<div class="chatbox-suggestions-container" id="chatbox-welcome-suggestions">';
        if (showBooking) {
          html += `
            <button class="chatbox-suggestion-pill" id="chatbox-suggest-book">
              <span>📅</span> <strong>Book an Appointment</strong>
            </button>
          `;
        }
        if (showLeadForm) {
          html += `
            <button class="chatbox-suggestion-pill" id="chatbox-suggest-lead">
              <span>📞</span> <strong>Leave a Message</strong>
            </button>
          `;
        }
        if (showHours) {
          html += `
            <button class="chatbox-suggestion-pill" id="chatbox-suggest-hours">
              <span>🕒</span> <strong>Business Hours</strong>
            </button>
          `;
        }
        if (showServices) {
          html += `
            <button class="chatbox-suggestion-pill" id="chatbox-suggest-services">
              <span>💼</span> <strong>Our Services</strong>
            </button>
          `;
        }
        if (showPricing) {
          html += `
            <button class="chatbox-suggestion-pill" id="chatbox-suggest-pricing">
              <span>💲</span> <strong>Pricing Plans</strong>
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
            Powered by <a href="#" target="_blank" rel="noopener">ChatBox AI</a>
          </div>
        </div>
      </div>
      <button id="chatbox-launcher" aria-label="Open Chat Support" aria-haspopup="dialog">
        <span id="chatbox-badge"></span>
        <svg class="icon-svg icon-chat" viewBox="0 0 24 24" width="26" height="26"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <svg class="icon-svg icon-close" viewBox="0 0 24 24" width="24" height="24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
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

    // Auto-resizing textarea implementation
    input.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
      
      // Update send button state
      if (this.value.trim().length > 0) {
        sendBtn.disabled = false;
      } else {
        sendBtn.disabled = true;
      }
    });

    function connectSuggestionsListeners() {
      const suggestBookBtn = document.getElementById('chatbox-suggest-book');
      if (suggestBookBtn) {
        suggestBookBtn.onclick = () => {
          removeSuggestions();
          appendMessage('user', 'I want to book an appointment');
          appendBookingWidget();
        };
      }
      const suggestLeadBtn = document.getElementById('chatbox-suggest-lead');
      if (suggestLeadBtn) {
        suggestLeadBtn.onclick = () => {
          removeSuggestions();
          input.value = 'I want to leave my contact details / get in touch';
          input.dispatchEvent(new Event('input'));
          handleSend();
        };
      }
      const suggestHoursBtn = document.getElementById('chatbox-suggest-hours');
      if (suggestHoursBtn) {
        suggestHoursBtn.onclick = () => {
          removeSuggestions();
          input.value = 'What are your business working hours?';
          input.dispatchEvent(new Event('input'));
          handleSend();
        };
      }
      const suggestServicesBtn = document.getElementById('chatbox-suggest-services');
      if (suggestServicesBtn) {
        suggestServicesBtn.onclick = () => {
          removeSuggestions();
          input.value = 'What services do you offer?';
          input.dispatchEvent(new Event('input'));
          handleSend();
        };
      }
      const suggestPricingBtn = document.getElementById('chatbox-suggest-pricing');
      if (suggestPricingBtn) {
        suggestPricingBtn.onclick = () => {
          removeSuggestions();
          input.value = 'What are your pricing plans?';
          input.dispatchEvent(new Event('input'));
          handleSend();
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
          conversationId = null;

          // Clear chat bubble containers
          body.innerHTML = `
            <div class="chatbox-message-row bot">
              ${avatarImg.replace('chatbox-avatar', 'chatbox-message-avatar')}
              <div class="chatbox-message">${welcomeMessage}</div>
            </div>
          `;

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

    function formatMessageText(text) {
      if (!text) return '';

      // Check if the response contains Business Working Hours
      if (text.includes('Business Working Hours') || text.includes('Business Hours') || text.includes('Working Hours')) {
        const lines = text.split('\n');
        let headerText = '';
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
            // Keep header information clean
            const cleanLine = line.replace(/(?:-|\*|\s)*\s*(?:\*\*)?/g, '').trim();
            headerText += (headerText ? '<br/>' : '') + cleanLine;
          }
        });
        hoursHtml += '</div>';

        if (hasHours) {
          return `<div style="font-weight: 500; margin-bottom: 6px;">${headerText}</div>${hoursHtml}`;
        }
      }

      let escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

      escaped = escaped.replace(/(https?:\/\/[^\s<]+)/g, `<a href="$1" target="_blank" style="color: ${primaryColor}; text-decoration: underline; font-weight: 500;">$1</a>`);
      escaped = escaped.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, `<a href="mailto:$1" style="color: ${primaryColor}; text-decoration: underline; font-weight: 500;">$1</a>`);
      escaped = escaped.replace(/(\+?[0-9]{1,3}[-.\s]?[0-9]{3}[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/g, `<a href="tel:$1" style="color: ${primaryColor}; text-decoration: underline; font-weight: 500;">$1</a>`);
      escaped = escaped.replace(/\n/g, '<br/>');

      return escaped;
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

    scrollLatestBtn.onclick = () => {
      scrollToBottom(true);
    };

    function scrollToBottom(force = false) {
      if (force) {
        body.scrollTop = body.scrollHeight;
        scrollLatestBtn.classList.remove('visible');
      } else {
        body.scrollTo({
          top: body.scrollHeight,
          behavior: 'smooth'
        });
      }
    }

    function scrollToLatestIfNeeded() {
      // Auto scroll if user is near bottom (e.g. less than 150px scrolled away)
      const isNearBottom = body.scrollHeight - body.scrollTop - body.clientHeight < 150;
      if (isNearBottom) {
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
          <h4>Select Service</h4>
          <div class="booking-skeleton"></div>
          <div class="booking-skeleton"></div>
        `;
        
        fetch(`${origin}/api/services?agentId=${agentId}`)
          .then(res => res.json())
          .then((services) => {
            const activeServices = services.filter(s => s.isActive);
            if (activeServices.length === 0) {
              wizard.innerHTML = `
                <h4>Select Service</h4>
                <div style="font-size: 13px; color: #ef4444; margin-bottom: 6px;">No bookable services are currently available.</div>
              `;
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
            scrollToLatestIfNeeded();
          })
          .catch(() => {
            wizard.innerHTML = `
              <h4>Select Service</h4>
              <div style="font-size: 12.5px; color: #ef4444; margin-bottom: 6px;">Failed to load services. Please try again.</div>
            `;
          });
      }

      // Step 2: Select Date
      function renderStep2() {
        const today = new Date().toISOString().split('T')[0];
        wizard.innerHTML = `
          <h4>Select Date</h4>
          <label class="booking-label">Choose appointment date</label>
          <input type="date" min="${today}" id="booking-date-picker" class="booking-input" />
          <button id="booking-date-next" class="booking-btn booking-btn-primary" style="margin-top: 6px;">Check Available Times</button>
        `;

        const datePicker = wizard.querySelector('#booking-date-picker');
        const nextBtn = wizard.querySelector('#booking-date-next');

        nextBtn.onclick = () => {
          if (!datePicker.value) {
            alert('Please select a valid date.');
            return;
          }
          selectedDate = datePicker.value;
          renderStep3();
        };
        scrollToLatestIfNeeded();
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
            if (slots.length === 0) {
              wizard.innerHTML = `
                <h4>Select Time</h4>
                <div style="font-size: 13px; color: #64748b; margin-bottom: 12px;">No slots available for ${selectedDate}.</div>
                <button id="booking-slot-back" class="booking-btn booking-btn-primary">Choose Another Date</button>
              `;
              wizard.querySelector('#booking-slot-back').onclick = renderStep2;
              return;
            }

            wizard.innerHTML = `
              <h4>Select Time</h4>
              <div style="font-size: 12px; color: #64748b;">Available times on ${selectedDate}:</div>
              <div class="booking-grid" id="slots-grid"></div>
              <button id="booking-slot-back" class="booking-btn" style="margin-top: 12px; text-align:center; justify-content:center; margin-bottom: 0;">Back to Dates</button>
            `;

            const grid = wizard.querySelector('#slots-grid');
            slots.forEach(slot => {
              const pill = document.createElement('div');
              pill.className = 'booking-grid-item';
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
          <input type="text" id="booking-notes" class="booking-input" placeholder="Any details..." />
          
          <div style="display: flex; gap: 8px; margin-top: 8px;">
            <button id="booking-details-back" class="booking-btn" style="margin-bottom:0; flex:1; text-align:center; justify-content:center;">Back</button>
            <button id="booking-details-next" class="booking-btn booking-btn-primary" style="margin-bottom:0; flex:1;">Next</button>
          </div>
        `;

        // Prepopulate values if any
        wizard.querySelector('#booking-name').value = clientDetails.name;
        wizard.querySelector('#booking-email').value = clientDetails.email;
        wizard.querySelector('#booking-phone').value = clientDetails.phone;
        wizard.querySelector('#booking-notes').value = clientDetails.notes;

        wizard.querySelector('#booking-details-back').onclick = renderStep3;
        wizard.querySelector('#booking-details-next').onclick = () => {
          const nameVal = wizard.querySelector('#booking-name').value.trim();
          const emailVal = wizard.querySelector('#booking-email').value.trim();
          
          if (!nameVal || !emailVal) {
            alert('Full Name and Email Address are required.');
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
          <h4 style="color: #10b981; display:flex; align-items:center; gap:6px;">
            <svg style="width:18px;height:18px;fill:#10b981;" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            Booking Confirmed
          </h4>
          <div style="font-size:13px; color:#64748b; line-height:1.4; margin-bottom:12px;">
            Your appointment has been booked successfully! A confirmation notice has been sent.
          </div>
          <div style="font-size:12px; background-color:#f8fafc; border: 1px solid #e2e8f0; border-radius:10px; padding:12px; line-height: 1.6;">
            <strong>Confirmation ID:</strong> <span style="font-family:monospace; color:${primaryColor};">${booking.id}</span><br/>
            <strong>Service:</strong> ${booking.serviceName}<br/>
            <strong>Business:</strong> ${booking.businessName}<br/>
            <strong>Time:</strong> ${selectedDate} at ${selectedSlot.localStart}
          </div>
        `;
        scrollToLatestIfNeeded();
      }
    }

    async function handleSend() {
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
              country: 'United States',
              browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Safari',
              pageUrl: window.location.href,
            }
          }),
        });

        if (body.contains(typingIndicatorRow)) {
          body.removeChild(typingIndicatorRow);
        }

        if (!response.ok) {
          throw new Error('API server returned error');
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
                // Remove the empty bot message container
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
                scrollToLatestIfNeeded();
              }
            } catch (err) {
              console.error('Error parsing line:', err);
            }
          }
          if (isBookingTriggered) break;
        }
      } catch (err) {
        if (body.contains(typingIndicatorRow)) {
          body.removeChild(typingIndicatorRow);
        }
        appendMessage('bot', "Connection failed or took too long to respond. Please check your network and try again.");
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

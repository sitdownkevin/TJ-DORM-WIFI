// ==UserScript==
// @name         TJ-DORM-WIFI 辅助
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  同济大学校园网登录和设备管理工具
// @author       sitdownkevin
// @match        http://172.21.0.54/*
// @match        http://172.21.0.54:801/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @connect      172.21.0.54
// @license      MIT
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // 创建UI界面
    function createUI() {
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            min-width: 300px;
        `;

        const title = document.createElement('h3');
        title.textContent = 'TJ-DORM-WIFI 辅助';
        title.style.cssText = `
            margin: 0 0 15px 0;
            color: #2c3e50;
            font-size: 18px;
            text-align: center;
            padding-bottom: 10px;
            border-bottom: 2px solid #eee;
        `;
        container.appendChild(title);

        // 创建登录区域
        const loginSection = document.createElement('div');
        loginSection.style.cssText = `
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            margin-bottom: 20px;
        `;

        const loginTitle = document.createElement('h4');
        loginTitle.textContent = '网络登录';
        loginTitle.style.cssText = `
            margin: 0 0 15px 0;
            color: #2c3e50;
            font-size: 16px;
            font-weight: 500;
        `;
        loginSection.appendChild(loginTitle);

        // 添加网络选择下拉框
        const networkSelector = document.createElement('select');
        networkSelector.id = 'network-type';
        networkSelector.style.cssText = `
            width: 100%;
            padding: 8px 12px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            outline: none;
            cursor: pointer;
            background-color: white;
            transition: border-color 0.2s;
        `;
        networkSelector.innerHTML = `
            <option value="2">中国移动</option>
            <option value="3">中国电信</option>
            <option value="4">中国联通</option>
            <option value="0">校园网</option>
        `;

        // 从存储中读取上次选择的网络类型
        const savedNetworkType = GM_getValue('networkType', '2');
        networkSelector.value = savedNetworkType;

        // 监听选择变化并保存
        networkSelector.addEventListener('change', function() {
            GM_setValue('networkType', this.value);
        });

        loginSection.appendChild(networkSelector);

        // 添加认证信息输入区域
        const credentialsContainer = document.createElement('div');
        credentialsContainer.style.cssText = `
            margin-bottom: 15px;
            display: grid;
            gap: 10px;
        `;

        // 用户名输入框
        const usernameInput = document.createElement('input');
        usernameInput.type = 'text';
        usernameInput.placeholder = '用户名';
        usernameInput.value = GM_getValue('username', '');
        usernameInput.style.cssText = `
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
        `;
        usernameInput.addEventListener('input', function() {
            GM_setValue('username', this.value);
        });
        credentialsContainer.appendChild(usernameInput);

        // 密码输入框
        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.placeholder = '密码';
        passwordInput.value = GM_getValue('password', '');
        passwordInput.style.cssText = `
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
        `;
        passwordInput.addEventListener('input', function() {
            GM_setValue('password', this.value);
        });
        credentialsContainer.appendChild(passwordInput);

        loginSection.appendChild(credentialsContainer);

        // 添加登录按钮容器
        const loginButtonContainer = document.createElement('div');
        loginButtonContainer.style.cssText = `
            display: flex;
            gap: 10px;
        `;

        // 添加登录按钮
        const loginButton = document.createElement('button');
        loginButton.textContent = '一键登录';
        loginButton.style.cssText = `
            padding: 8px 16px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            flex: 1;
            transition: background-color 0.2s;
        `;
        loginButton.onmouseover = () => loginButton.style.backgroundColor = '#45a049';
        loginButton.onmouseout = () => loginButton.style.backgroundColor = '#4CAF50';
        loginButton.onclick = () => autoLogin();
        loginButtonContainer.appendChild(loginButton);

        // 添加登出按钮
        const logoutButton = document.createElement('button');
        logoutButton.textContent = '退出登录';
        logoutButton.style.cssText = `
            padding: 8px 16px;
            background-color: #f44336;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            flex: 1;
            transition: background-color 0.2s;
        `;
        logoutButton.onmouseover = () => logoutButton.style.backgroundColor = '#d32f2f';
        logoutButton.onmouseout = () => logoutButton.style.backgroundColor = '#f44336';
        logoutButton.onclick = () => autoLogout();
        loginButtonContainer.appendChild(logoutButton);

        loginSection.appendChild(loginButtonContainer);
        container.appendChild(loginSection);

        // 创建设备查询区域
        const querySection = document.createElement('div');
        querySection.style.cssText = `
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
        `;

        const queryTitle = document.createElement('h4');
        queryTitle.textContent = '设备查询';
        queryTitle.style.cssText = `
            margin: 0 0 15px 0;
            color: #2c3e50;
            font-size: 16px;
            font-weight: 500;
        `;
        querySection.appendChild(queryTitle);

        // 添加查询容器
        const queryContainer = document.createElement('div');
        queryContainer.style.cssText = `
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
        `;

        // 添加输入框
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = '输入学号(如: 24311XX)';
        input.style.cssText = `
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
        `;
        input.onfocus = () => input.style.borderColor = '#4CAF50';
        input.onblur = () => input.style.borderColor = '#ddd';
        queryContainer.appendChild(input);

        // 添加查询按钮
        const queryButton = document.createElement('button');
        queryButton.textContent = '查询';
        queryButton.style.cssText = `
            padding: 8px 16px;
            background-color: #2196F3;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;
        `;
        queryButton.onmouseover = () => queryButton.style.backgroundColor = '#1976D2';
        queryButton.onmouseout = () => queryButton.style.backgroundColor = '#2196F3';
        queryButton.onclick = () => findMacAddresses(input.value);
        queryContainer.appendChild(queryButton);

        querySection.appendChild(queryContainer);

        // 添加结果显示区域
        const results = document.createElement('div');
        results.id = 'query-results';
        results.style.cssText = `
            max-height: 400px;
            overflow-y: auto;
            padding-right: 5px;
        `;
        querySection.appendChild(results);

        container.appendChild(querySection);

        document.body.appendChild(container);
    }

    // 解析响应数据
    function parseResponse(responseText) {
        if (!responseText) return [];

        const jsonStr = responseText.substring(7, responseText.length - 2);
        try {
            const data = JSON.parse(jsonStr);
            return data.list || [];
        } catch (e) {
            console.error('解析JSON失败:', e);
            return [];
        }
    }

    // 查询MAC地址
    function findMacAddresses(userAccount) {
        const url = 'http://172.21.0.54:801/eportal/portal/mac/find';
        const params = {
            callback: 'dr1002',
            user_account: userAccount,
            login_method: '0',
            find_mac: '0'
        };

        const queryString = Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');

        GM_xmlhttpRequest({
            method: 'GET',
            url: `${url}?${queryString}`,
            headers: {
                'Host': '172.21.0.54:801',
                'Connection': 'keep-alive',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Sec-GPC': '1',
                'Accept-Language': 'zh-CN,zh',
                'Referer': 'http://172.21.0.54/',
            },
            onload: function(response) {
                const devices = parseResponse(response.responseText);
                displayResults(devices);
            },
            onerror: function(error) {
                console.error('请求失败:', error);
                displayResults([]);
            }
        });
    }

    // 自动登录功能
    function autoLogin() {
        const networkType = document.getElementById('network-type').value;
        const username = GM_getValue('username', '');
        const password = GM_getValue('password', '');

        if (!username || !password) {
            alert('请先输入用户名和密码');
            return;
        }

        const loginUrl = `http://172.21.0.54/drcom/login?callback=dr1003&DDDDD=${username}&upass=${password}&0MKKey=123456&R1=0&R2=&R3=${networkType}&R6=0&para=00&v6ip=&terminal_type=1&lang=zh-cn&jsVersion=4.1&v=2653&lang=zh`;

        GM_xmlhttpRequest({
            method: 'GET',
            url: loginUrl,
            headers: {
                'Host': '172.21.0.54',
                'Connection': 'keep-alive',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Sec-GPC': '1',
                'Accept-Language': 'zh-CN,zh',
                'Referer': 'http://172.21.0.54/'
            },
            onload: function(response) {
                console.log('登录响应:', response.responseText);
                setTimeout(() => {
                    window.location.reload();
                }, 100); // 刷新页面
            },
            onerror: function(error) {
                console.error('登录失败:', error);
                alert('登录失败，请检查网络连接');
            }
        });
    }

    // 自动登出功能
    function autoLogout() {
        const logoutUrl = "http://172.21.0.54/drcom/logout?callback=dr1006&jsVersion=4.1&v=6752&lang=zh";

        GM_xmlhttpRequest({
            method: 'GET',
            url: logoutUrl,
            headers: {
                'Host': '172.21.0.54',
                'Connection': 'keep-alive',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Sec-GPC': '1',
                'Accept-Language': 'zh-CN,zh',
                'Referer': 'http://172.21.0.54/'
            },
            onload: function(response) {
                console.log('登出响应:', response.responseText);
                setTimeout(() => {
                    window.location.reload();
                }, 100); // 刷新页面
            },
            onerror: function(error) {
                console.error('登出失败:', error);
                alert('登出失败，请检查网络连接');
            }
        });
    }

    // 显示结果
    function displayResults(devices) {
        const resultsDiv = document.getElementById('query-results');
        resultsDiv.innerHTML = '';

        if (devices.length === 0) {
            resultsDiv.innerHTML = '<p style="color: #666; text-align: center; padding: 10px;">未找到设备信息</p>';
            return;
        }

        devices.forEach(device => {
            const deviceInfo = document.createElement('div');
            deviceInfo.style.cssText = `
                margin-top: 10px;
                padding: 15px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                background-color: #f8f9fa;
                transition: transform 0.2s;
            `;
            deviceInfo.onmouseover = () => {
                deviceInfo.style.transform = 'translateY(-2px)';
                deviceInfo.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            };
            deviceInfo.onmouseout = () => {
                deviceInfo.style.transform = 'translateY(0)';
                deviceInfo.style.boxShadow = 'none';
            };

            deviceInfo.innerHTML = `
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px; font-size: 14px;">
                    <div style="color: #666;"><strong>账号:</strong></div>
                    <div>${device.user_account}</div>
                    <div style="color: #666;"><strong>MAC地址:</strong></div>
                    <div>${device.online_mac}</div>
                    <div style="color: #666;"><strong>IP地址:</strong></div>
                    <div>${device.online_ip}</div>
                    <div style="color: #666;"><strong>在线时间:</strong></div>
                    <div>${device.online_time}</div>
                    <div style="color: #666;"><strong>持续时间:</strong></div>
                    <div>${device.time_long}秒</div>
                    <div style="color: #666;"><strong>上行流量:</strong></div>
                    <div>${formatBytes(device.uplink_bytes)}</div>
                    <div style="color: #666;"><strong>下行流量:</strong></div>
                    <div>${formatBytes(device.downlink_bytes)}</div>
                </div>
            `;

            resultsDiv.appendChild(deviceInfo);
        });
    }

    // 格式化字节数
    function formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 启动脚本
    function initScript() {
        // 确保DOM已完全加载
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(createUI, 500); // 添加小延迟确保DOM完全准备好
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(createUI, 500);
            });
        }
    }

    // 启动初始化
    initScript();
})();
// ==UserScript==
// @name         TJ-DORM-WIFI 辅助
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  同济大学宿舍网络登录助手
// @author       kexu
// @match        http://172.21.0.54/*
// @match        http://172.21.0.54:8080/*
// @match        http://172.21.0.54/index.html*
// @match        http://172.21.0.54/drcom/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @connect      172.21.0.54
// ==/UserScript==

(function() {
    'use strict';

    // 添加全局样式
    GM_addStyle(`
        .tj-wifi-container {
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            z-index: 999999 !important;
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            min-width: 300px;
        }
        
        .status-card {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
    `);

    // 检查UI是否已存在
    function isUIExists() {
        return document.getElementById('login-container') !== null;
    }

    // 创建UI
    function createUI() {
        if (isUIExists()) return;

        const container = document.createElement('div');
        container.id = 'login-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 300px;
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            z-index: 10000;
        `;

        // 添加标题
        const title = document.createElement('h2');
        title.textContent = 'TJ-DORM-WIFI 辅助';
        title.style.cssText = `
            margin: 0 0 20px 0;
            text-align: center;
            color: #2c3e50;
            font-size: 20px;
            font-weight: 600;
        `;
        container.appendChild(title);

        // 添加登录部分
        const loginSection = document.createElement('div');
        loginSection.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 20px;
        `;

        // 添加用户名输入框
        const username = document.createElement('input');
        username.id = 'username';
        username.type = 'text';
        username.placeholder = '学号';
        username.value = GM_getValue('username', '');
        username.style.cssText = `
            width: 100%;
            padding: 10px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s;
            box-sizing: border-box;
            &:focus {
                border-color: #4285f4;
                outline: none;
            }
        `;

        // 添加密码输入框
        const password = document.createElement('input');
        password.id = 'password';
        password.type = 'password';
        password.placeholder = '密码';
        password.value = GM_getValue('password', '');
        password.style.cssText = username.style.cssText;

        // 添加网络选择下拉框
        const networkSelector = document.createElement('select');
        networkSelector.id = 'network-type';
        networkSelector.style.cssText = `
            width: 100%;
            padding: 10px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            background-color: white;
            cursor: pointer;
            transition: border-color 0.3s;
            box-sizing: border-box;
            &:focus {
                border-color: #4285f4;
                outline: none;
            }
        `;
        networkSelector.innerHTML = `
            <option value="0">校园网</option>
            <option value="2">中国移动</option>
            <option value="3">中国联通</option>
            <option value="4">中国电信</option>
        `;

        const savedNetworkType = GM_getValue('networkType', '0');
        networkSelector.value = savedNetworkType;

        networkSelector.addEventListener('change', function() {
            GM_setValue('networkType', this.value);
        });

        // 添加按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: grid;
            grid-template-columns: 1fr;
            gap: 10px;
            margin-top: 10px;
        `;

        // 添加登录按钮
        const loginButton = document.createElement('button');
        loginButton.textContent = '登录';
        loginButton.style.cssText = `
            padding: 10px;
            border: none;
            border-radius: 8px;
            background-color: #4285f4;
            color: white;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.3s;
            &:hover {
                background-color: #3367d6;
            }
        `;
        loginButton.addEventListener('click', autoLogin);

        // 添加登出按钮
        const logoutButton = document.createElement('button');
        logoutButton.textContent = '登出';
        logoutButton.style.cssText = `
            padding: 10px;
            border: none;
            border-radius: 8px;
            background-color: #dc3545;
            color: white;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.3s;
            &:hover {
                background-color: #c82333;
            }
        `;
        logoutButton.addEventListener('click', autoLogout);

        // 添加设备列表按钮
        const deviceButton = document.createElement('button');
        deviceButton.textContent = '查看设备列表';
        deviceButton.style.cssText = `
            padding: 10px;
            border: none;
            border-radius: 8px;
            background-color: #17a2b8;
            color: white;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.3s;
            &:hover {
                background-color: #138496;
            }
        `;
        deviceButton.addEventListener('click', getDeviceList);

        // 添加状态显示区域
        const statusDiv = document.createElement('div');
        statusDiv.id = 'login-status';
        statusDiv.style.cssText = `
            margin-top: 15px;
            padding: 12px;
            border-radius: 8px;
            background-color: #f8f9fa;
            font-size: 14px;
        `;

        // 添加设备列表显示区域
        const deviceListDiv = document.createElement('div');
        deviceListDiv.id = 'device-list';
        deviceListDiv.style.cssText = `
            margin-top: 15px;
            padding: 12px;
            border-radius: 8px;
            background-color: #f8f9fa;
            font-size: 14px;
            display: none;
        `;

        // 组装UI
        loginSection.appendChild(username);
        loginSection.appendChild(password);
        loginSection.appendChild(networkSelector);
        buttonContainer.appendChild(loginButton);
        buttonContainer.appendChild(logoutButton);
        buttonContainer.appendChild(deviceButton);
        loginSection.appendChild(buttonContainer);
        container.appendChild(loginSection);
        container.appendChild(statusDiv);
        container.appendChild(deviceListDiv);

        document.body.appendChild(container);

        // 保存用户名和密码
        username.addEventListener('change', () => GM_setValue('username', username.value));
        password.addEventListener('change', () => GM_setValue('password', password.value));

        // 启动定时检查
        checkLoginStatus();
        setInterval(checkLoginStatus, 30000);
    }

    // 自动登录功能
    function autoLogin() {
        const username = document.getElementById('username')?.value;
        const password = document.getElementById('password')?.value;
        const networkType = document.getElementById('network-type')?.value || '0';

        if (!username || !password) {
            updateStatus('请输入用户名和密码', 'error');
            return;
        }

        // 根据网络类型构建登录参数
        const loginParams = {
            callback: 'dr1003',
            DDDDD: username,
            upass: password,
            '0MKKey': '123456',
            R1: '0',
            R2: '',
            R3: networkType,  // 使用选择的网络类型
            R6: '0',
            para: '00',
            v6ip: '',
            terminal_type: '1',
            lang: 'zh-cn',
            jsVersion: '4.1',
            v: '2653',
            lang: 'zh'
        };

        // 构建URL参数字符串
        const queryString = Object.entries(loginParams)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');

        const loginUrl = `http://172.21.0.54/drcom/login?${queryString}`;

        GM_xmlhttpRequest({
            method: 'GET',
            url: loginUrl,
            onload: function(response) {
                if (response.status === 200) {
                    updateStatus('登录请求已发送...', 'info');
                    setTimeout(() => {
                        checkLoginStatus(() => {
                            setTimeout(() => {
                                window.location.reload();
                            }, 300);
                        });
                    }, 500);
                } else {
                    updateStatus('登录请求失败', 'error');
                    setTimeout(() => {
                        window.location.reload();
                    }, 800);
                }
            },
            onerror: function() {
                updateStatus('网络错误', 'error');
                setTimeout(() => {
                    window.location.reload();
                }, 800);
            }
        });
    }

    // 自动登出功能
    function autoLogout() {
        GM_xmlhttpRequest({
            method: 'GET',
            url: 'http://172.21.0.54/drcom/logout?callback=dr1006',
            onload: function(response) {
                if (response.status === 200) {
                    updateStatus('已登出', 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 800);
                } else {
                    updateStatus('登出失败', 'error');
                    setTimeout(() => {
                        window.location.reload();
                    }, 800);
                }
            },
            onerror: function() {
                updateStatus('网络错误', 'error');
                setTimeout(() => {
                    window.location.reload();
                }, 800);
            }
        });
    }

    // 检查登录状态
    function checkLoginStatus(callback) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: 'http://172.21.0.54/',
            timeout: 5000,
            onload: function(response) {
                try {
                    const isLoggedIn = response.responseText.includes('注销页') && 
                                     !response.responseText.includes('上网登录页');
                    
                    if (isLoggedIn) {
                        const uidMatch = response.responseText.match(/uid\s*=\s*["']([^"']+)["']/);
                        const nameMatch = response.responseText.match(/NID\s*=\s*["']([^"']+)["']/);
                        const ipMatch = response.responseText.match(/v4ip\s*=\s*["']([^"']+)["']/);
                        const loginTimeMatch = response.responseText.match(/stime\s*=\s*["']([^"']+)["']/);
                        
                        const uid = uidMatch ? uidMatch[1].trim() : '未知';
                        const name = nameMatch ? nameMatch[1].trim() : '未知';
                        const ip = ipMatch ? ipMatch[1].trim() : '未知';
                        const loginTime = loginTimeMatch ? loginTimeMatch[1].trim() : '未知';

                        const statusInfo = {
                            type: 'success',
                            status: '在线',
                            details: {
                                学号: uid,
                                姓名: name,
                                IP: ip,
                                登录时间: loginTime
                            }
                        };
                        updateStatusWithFormat(statusInfo);
                    } else {
                        updateStatusWithFormat({
                            type: 'error',
                            status: '离线',
                            message: '未登录'
                        });
                    }
                    
                    if (callback) callback();
                } catch (error) {
                    console.error('解析登录状态失败:', error);
                    updateStatusWithFormat({
                        type: 'warning',
                        status: '错误',
                        message: '状态检查失败'
                    });
                    if (callback) callback();
                }
            },
            onerror: function() {
                updateStatusWithFormat({
                    type: 'error',
                    status: '错误',
                    message: '网络请求失败'
                });
                if (callback) callback();
            }
        });
    }

    // 格式化状态显示
    function updateStatusWithFormat(statusInfo) {
        const statusDiv = document.getElementById('login-status');
        if (!statusDiv) return;

        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8',
            warning: '#ffc107'
        };

        const icons = {
            success: '✓',
            error: '✗',
            info: 'ℹ',
            warning: '⚠️'
        };

        let content = `
            <div class="status-card" style="
                background: white;
                border-radius: 8px;
                overflow: hidden;
                border: 1px solid ${colors[statusInfo.type]}20;
            ">
                <div style="
                    display: flex;
                    align-items: center;
                    padding: 12px;
                    background: ${colors[statusInfo.type]}10;
                    border-bottom: 1px solid ${colors[statusInfo.type]}20;
                ">
                    <span style="
                        color: ${colors[statusInfo.type]};
                        font-weight: 500;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    ">
                        ${icons[statusInfo.type]}
                        ${statusInfo.status}
                    </span>
                </div>
        `;

        if (statusInfo.details) {
            content += `
                <div style="padding: 12px;">
                    <div style="
                        display: grid;
                        gap: 8px;
                        color: #4a5568;
                    ">
            `;
            
            for (const [key, value] of Object.entries(statusInfo.details)) {
                content += `
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 4px 0;
                    ">
                        <span style="color: #718096; font-size: 13px;">${key}</span>
                        <span style="font-weight: 500;">${value}</span>
                    </div>
                `;
            }
            
            content += `
                    </div>
                </div>
            `;
        } else if (statusInfo.message) {
            content += `
                <div style="
                    padding: 12px;
                    color: #4a5568;
                    text-align: center;
                ">
                    ${statusInfo.message}
                </div>
            `;
        }

        content += `
                <div style="
                    padding: 8px 12px;
                    background: ${colors[statusInfo.type]}05;
                    border-top: 1px solid ${colors[statusInfo.type]}20;
                    font-size: 12px;
                    color: #718096;
                    text-align: right;
                ">
                    更新时间: ${new Date().toLocaleTimeString()}
                </div>
            </div>
        `;

        statusDiv.innerHTML = content;
    }

    // 更新状态显示（兼容旧的调用方式）
    function updateStatus(message, type = 'info') {
        if (message.includes('在线')) {
            const parts = message.split(' ');
            updateStatusWithFormat({
                type: 'success',
                status: '在线',
                details: {
                    学号: parts[2].split(':')[1],
                    姓名: parts[3].split(':')[1],
                    IP: parts[4].split(':')[1],
                    登录时间: parts[5].split(':').slice(1).join(':')
                }
            });
        } else {
            updateStatusWithFormat({
                type,
                status: type === 'success' ? '成功' : type === 'error' ? '错误' : '提示',
                message
            });
        }
    }

    // 获取设备列表
    function getDeviceList() {
        const username = document.getElementById('username')?.value;
        
        if (!username) {
            updateStatus('请先输入学号', 'error');
            return;
        }

        const deviceListUrl = `http://172.21.0.54:801/eportal/portal/mac/find?callback=dr1002&user_account=${username}`;

        GM_xmlhttpRequest({
            method: 'GET',
            url: deviceListUrl,
            headers: {
                'Host': '172.21.0.54:801',
                'Connection': 'keep-alive',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Sec-GPC': '1',
                'Accept-Language': 'zh-CN,zh',
                'Referer': 'http://172.21.0.54/'
            },
            onload: function(response) {
                try {
                    // 解析返回的数据
                    let jsonStr = response.responseText;
                    
                    // 调试输出
                    console.log('Raw response:', jsonStr);

                    // 提取JSON部分
                    const match = jsonStr.match(/dr1002\((.*)\)/);
                    if (!match || !match[1]) {
                        throw new Error('Invalid response format');
                    }
                    jsonStr = match[1];
                    
                    // 调试输出
                    console.log('Extracted JSON:', jsonStr);
                    
                    const data = JSON.parse(jsonStr);
                    console.log('Parsed data:', data);

                    if (data.result === 1 && Array.isArray(data.list)) {
                        displayDeviceList(data.list, data.total);
                    } else {
                        updateDeviceListStatus(data.msg || '无设备数据', 'info');
                    }
                } catch (error) {
                    console.error('解析设备列表失败:', error);
                    console.error('原始数据:', response.responseText);
                    updateDeviceListStatus('获取设备列表失败: ' + error.message, 'error');
                }
            },
            onerror: function() {
                updateDeviceListStatus('网络请求失败', 'error');
            }
        });
    }

    // 显示设备列表
    function displayDeviceList(devices, total) {
        const deviceListDiv = document.getElementById('device-list');
        if (!deviceListDiv) return;

        deviceListDiv.style.display = 'block';
        deviceListDiv.style.maxHeight = '400px'; // 设置最大高度
        deviceListDiv.style.overflowY = 'auto';  // 允许垂直滚动
        deviceListDiv.style.marginBottom = '20px'; // 底部留空间

        // 生成设备列表HTML
        let content = `
            <div class="device-list-card" style="
                background: white;
                border-radius: 8px;
                overflow: hidden;
                border: 1px solid #17a2b820;
            ">
                <div style="
                    display: flex;
                    align-items: center;
                    padding: 12px;
                    background: #17a2b810;
                    border-bottom: 1px solid #17a2b820;
                    position: sticky;
                    top: 0;
                    z-index: 1;
                    background: white;
                ">
                    <span style="
                        color: #17a2b8;
                        font-weight: 500;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    ">
                        设备列表 (共${total}台)
                    </span>
                </div>
                <div style="padding: 12px;">
                    <div style="
                        display: grid;
                        gap: 16px;
                        color: #4a5568;
                    ">
        `;

        // 添加每个设备的信息
        devices.forEach((device, index) => {
            // 计算在线时长
            const timeLong = parseInt(device.time_long);
            const hours = Math.floor(timeLong / 3600);
            const minutes = Math.floor((timeLong % 3600) / 60);
            const seconds = timeLong % 60;
            const timeStr = `${hours}小时${minutes}分${seconds}秒`;

            // 计算流量
            const uplink = (parseInt(device.uplink_bytes) / 1024 / 1024).toFixed(2);
            const downlink = (parseInt(device.downlink_bytes) / 1024 / 1024).toFixed(2);

            // 格式化登录时间
            const loginTime = device.online_time.split(' ');
            const datePart = loginTime[0];
            const timePart = loginTime[1];

            content += `
                <div style="
                    padding: 12px;
                    background: #e3f2fd;
                    border-radius: 6px;
                    border: 1px solid #90caf9;
                ">
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 8px;
                    ">
                        <span style="
                            font-weight: 500;
                            color: #1976d2;
                        ">
                            设备 ${index + 1}
                        </span>
                        <span style="
                            font-size: 12px;
                            padding: 2px 8px;
                            border-radius: 12px;
                            background: #28a74520;
                            color: #28a745;
                        ">
                            在线
                        </span>
                    </div>
                    <div style="display: grid; gap: 4px;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #718096; font-size: 13px;">MAC地址</span>
                            <span style="text-align: right;">${device.online_mac || '-'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #718096; font-size: 13px;">IP地址</span>
                            <span style="text-align: right;">${device.online_ip || '-'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <span style="color: #718096; font-size: 13px;">登录时间</span>
                            <span style="text-align: right;">
                                ${datePart}<br>${timePart}
                            </span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #718096; font-size: 13px;">在线时长</span>
                            <span style="text-align: right;">${timeStr}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #718096; font-size: 13px;">上行流量</span>
                            <span style="text-align: right;">${uplink} MB</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #718096; font-size: 13px;">下行流量</span>
                            <span style="text-align: right;">${downlink} MB</span>
                        </div>
                    </div>
                </div>
            `;
        });

        content += `
                    </div>
                </div>
                <div style="
                    padding: 8px 12px;
                    background: #17a2b805;
                    border-top: 1px solid #17a2b820;
                    font-size: 12px;
                    color: #718096;
                    text-align: right;
                    position: sticky;
                    bottom: 0;
                    background: white;
                ">
                    更新时间: ${new Date().toLocaleTimeString()}
                </div>
            </div>
        `;

        deviceListDiv.innerHTML = content;
    }

    // 更新设备列表状态
    function updateDeviceListStatus(message, type) {
        const deviceListDiv = document.getElementById('device-list');
        if (!deviceListDiv) return;

        deviceListDiv.style.display = 'block';

        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8',
            warning: '#ffc107'
        };

        deviceListDiv.innerHTML = `
            <div style="
                padding: 12px;
                color: ${colors[type]};
                text-align: center;
                background: white;
                border-radius: 8px;
                border: 1px solid ${colors[type]}20;
            ">
                ${message}
            </div>
        `;
    }

    // 启动登录状态检查
    function startLoginStatusCheck() {
        checkLoginStatus();
        setInterval(checkLoginStatus, 30000);
    }

    // 初始化脚本
    function initScript() {
        if (window.top !== window.self) return;
        if (window.tjWifiInitialized) return;
        window.tjWifiInitialized = true;

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createUI);
            document.addEventListener('DOMContentLoaded', () => setTimeout(startLoginStatusCheck, 1000));
        } else {
            createUI();
            setTimeout(startLoginStatusCheck, 1000);
        }
    }

    // 启动脚本
    initScript();
})();
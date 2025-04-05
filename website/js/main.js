// 当前语言
let currentLang = 'en';

// 获取翻译文本
function t(key) {
    return translations[currentLang][key] || key;
}

// 更新页面文本
function updatePageText() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = t(key);
            } else if (element.innerHTML.includes('<')) {
                // 如果元素包含HTML，使用innerHTML
                element.innerHTML = t(key);
            } else {
                element.textContent = t(key);
            }
        }
    });

    // 更新页面标题
    document.title = currentLang === 'en' ?
        'Apex AI Proxy - Your Free Personal AI Gateway' :
        'Apex AI Proxy - 您的免费个人 AI 网关';

    // 更新meta描述
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.content = currentLang === 'en' ?
            'Apex AI Proxy is a free personal AI Gateway running on Cloudflare Workers, aggregating multiple AI service providers to overcome rate limits.' :
            'Apex AI Proxy 是一个运行在 Cloudflare Workers 上的免费个人 AI 网关，聚合多个 AI 服务提供商，突破调用频率限制。';
    }

    // 更新HTML语言属性
    document.documentElement.lang = currentLang === 'en' ? 'en' : 'zh-CN';
}

// 切换语言
function switchLanguage(lang) {
    if (lang === currentLang) return;

    currentLang = lang;
    localStorage.setItem('apex-ai-proxy-lang', lang);
    updatePageText();
}

document.addEventListener('DOMContentLoaded', function() {
    // 初始化语言
    const savedLang = localStorage.getItem('apex-ai-proxy-lang');
    if (savedLang) {
        currentLang = savedLang;
    } else {
        // 检测浏览器语言
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('zh')) {
            currentLang = 'zh';
        } else {
            currentLang = 'en';
        }
    }

    // 更新语言切换按钮状态
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        if (btn.getAttribute('data-lang') === currentLang) {
            btn.classList.add('active');
        }

        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            switchLanguage(lang);

            // 更新按钮状态
            langBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 初始化页面文本
    updatePageText();

    // 移动端菜单切换
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');

    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
    }

    // 确保在页面加载时初始化所有折叠监听器
    setTimeout(() => {
        initCollapsibleListeners();
    }, 100);

    // 代码选项卡切换
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');

            // 移除所有选项卡的活动状态
            tabBtns.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // 添加当前选项卡的活动状态
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // 配置工具功能
    initConfigTool();

    // 平滑滚动
    const scrollLinks = document.querySelectorAll('a[href^="#"]');

    scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });

                // 如果在移动端，点击后关闭菜单
                if (nav && nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                }
            }
        });
    });

    // 复制按钮功能
    const copyBtns = document.querySelectorAll('.copy-btn');

    copyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-clipboard-target');
            let textToCopy;

            if (targetId) {
                textToCopy = document.querySelector(targetId).textContent;
            } else {
                const codeBlock = this.closest('.code-block');
                if (codeBlock) {
                    textToCopy = codeBlock.querySelector('pre code').textContent;
                }
            }

            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    const originalIcon = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-check"></i>';

                    setTimeout(() => {
                        this.innerHTML = originalIcon;
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            }
        });
    });

    // 折叠/展开功能
    document.querySelectorAll('.collapsible-header').forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            if (content && content.classList.contains('collapsible-content')) {
                this.classList.toggle('collapsed');
                content.classList.toggle('collapsed');

                // 更新图标
                const icon = this.querySelector('.collapse-icon');
                if (icon) {
                    if (content.classList.contains('collapsed')) {
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-right');
                    } else {
                        icon.classList.remove('fa-chevron-right');
                        icon.classList.add('fa-chevron-down');
                    }
                }
            }
        });
    });

    // 全部折叠/展开按钮
    const collapseAllBtn = document.getElementById('collapse-all');
    const expandAllBtn = document.getElementById('expand-all');

    if (collapseAllBtn) {
        collapseAllBtn.addEventListener('click', function() {
            document.querySelectorAll('.collapsible-content').forEach(content => {
                content.classList.add('collapsed');
                const header = content.previousElementSibling;
                if (header && header.classList.contains('collapsible-header')) {
                    header.classList.add('collapsed');
                    const icon = header.querySelector('.collapse-icon');
                    if (icon) {
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-right');
                    }
                }
            });
        });
    }

    if (expandAllBtn) {
        expandAllBtn.addEventListener('click', function() {
            document.querySelectorAll('.collapsible-content').forEach(content => {
                content.classList.remove('collapsed');
                const header = content.previousElementSibling;
                if (header && header.classList.contains('collapsible-header')) {
                    header.classList.remove('collapsed');
                    const icon = header.querySelector('.collapse-icon');
                    if (icon) {
                        icon.classList.remove('fa-chevron-right');
                        icon.classList.add('fa-chevron-down');
                    }
                }
            });
        });
    }
});

// 配置工具功能
function initConfigTool() {
    // 获取DOM元素
    const providersContainer = document.getElementById('providers-container');
    const modelsContainer = document.getElementById('models-container');
    const addProviderBtn = document.getElementById('add-provider');
    const addModelBtn = document.getElementById('add-model');
    const generateConfigBtn = document.getElementById('generate-config');
    const configOutput = document.getElementById('config-output');
    const copyConfigBtn = document.getElementById('copy-config');
    const downloadConfigBtn = document.getElementById('download-config');
    const resetFormBtn = document.getElementById('reset-form');
    const generateApiKeyBtn = document.getElementById('generate-api-key');
    const serviceApiKeyInput = document.getElementById('service-api-key');
    const collapseAllBtn = document.getElementById('collapse-all');
    const expandAllBtn = document.getElementById('expand-all');

    // 初始化提供商和模型计数器
    let providerCount = 1;
    let modelCount = 1;

    // 添加提供商
    addProviderBtn.addEventListener('click', function() {
        const providerHtml = `
            <div class="provider-form">
                <div class="collapsible-header collapsed">
                    <span class="provider-title" id="provider-title-${providerCount}">${t('config_provider_name')} ${providerCount}</span>
                    <i class="fas fa-chevron-right collapse-icon"></i>
                </div>
                <div class="collapsible-content collapsed">
                    <div class="form-group">
                        <label for="provider-name-${providerCount}" data-i18n="config_provider_name">${t('config_provider_name')}</label>
                        <input type="text" id="provider-name-${providerCount}" data-i18n="config_provider_name_placeholder" placeholder="${t('config_provider_name_placeholder')}" oninput="updateProviderTitle(${providerCount}, this.value)">
                    </div>
                    <div class="form-group">
                        <label for="provider-base-url-${providerCount}" data-i18n="config_base_url">${t('config_base_url')}</label>
                        <input type="text" id="provider-base-url-${providerCount}" data-i18n="config_base_url_placeholder" placeholder="${t('config_base_url_placeholder')}">
                    </div>
                    <div class="form-group">
                        <label for="provider-api-keys-${providerCount}" data-i18n="config_api_keys">${t('config_api_keys')}</label>
                        <textarea id="provider-api-keys-${providerCount}" data-i18n="config_api_keys_placeholder" placeholder="${t('config_api_keys_placeholder')}"></textarea>
                    </div>
                    <button type="button" class="btn btn-danger remove-provider" data-index="${providerCount}" data-i18n="btn_remove">${t('btn_remove')}</button>
                </div>
            </div>
        `;

        providersContainer.insertAdjacentHTML('beforeend', providerHtml);
        providerCount++;

        // 更新所有模型中的提供商选择列表
        updateProviderSelects();

        // 添加删除提供商事件监听器
        const removeProviderBtns = document.querySelectorAll('.remove-provider');
        removeProviderBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                this.closest('.provider-form').remove();
                updateProviderSelects();
            });
        });

        // 添加折叠/展开事件监听器
        initCollapsibleListeners();
    });

    // 添加模型
    addModelBtn.addEventListener('click', function() {
        const modelHtml = `
            <div class="model-form">
                <div class="collapsible-header collapsed">
                    <span class="model-title" id="model-title-${modelCount}">${t('config_model_name')} ${modelCount}</span>
                    <i class="fas fa-chevron-right collapse-icon"></i>
                </div>
                <div class="collapsible-content collapsed">
                    <div class="form-group">
                        <label for="model-name-${modelCount}" data-i18n="config_model_name">${t('config_model_name')}</label>
                        <input type="text" id="model-name-${modelCount}" data-i18n="config_model_name_placeholder" placeholder="${t('config_model_name_placeholder')}" oninput="updateModelTitle(${modelCount}, this.value)">
                    </div>
                    <div class="model-providers" id="model-providers-${modelCount}">
                        <div class="model-provider">
                            <div class="collapsible-header collapsed">
                                <span class="provider-title" id="model-provider-title-${modelCount}-0">${t('config_model_provider')} 1</span>
                                <i class="fas fa-chevron-right collapse-icon"></i>
                            </div>
                            <div class="collapsible-content collapsed">
                                <div class="form-group">
                                    <label for="model-provider-name-${modelCount}-0" data-i18n="config_model_provider">${t('config_model_provider')}</label>
                                    <select id="model-provider-name-${modelCount}-0" class="provider-select" onchange="updateModelProviderTitle(${modelCount}, 0, this.value)">
                                        <option value="" data-i18n="config_select_provider">${t('config_select_provider')}</option>
                                        ${getProviderOptions()}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="model-provider-model-${modelCount}-0" data-i18n="config_provider_model">${t('config_provider_model')}</label>
                                    <input type="text" id="model-provider-model-${modelCount}-0" data-i18n="config_provider_model_placeholder" placeholder="${t('config_provider_model_placeholder')}">
                                </div>
                                <button type="button" class="btn btn-danger remove-model-provider" data-model-index="${modelCount}" data-provider-index="0" data-i18n="btn_remove">${t('btn_remove')}</button>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="btn btn-secondary add-model-provider" data-model-index="${modelCount}" data-i18n="btn_add_model_provider">${t('btn_add_model_provider')}</button>
                    <button type="button" class="btn btn-danger remove-model" data-index="${modelCount}" data-i18n="btn_remove">${t('btn_remove')}</button>
                </div>
            </div>
        `;

        modelsContainer.insertAdjacentHTML('beforeend', modelHtml);

        // 添加删除模型事件监听器
        document.querySelector(`.remove-model[data-index="${modelCount}"]`).addEventListener('click', function() {
            this.closest('.model-form').remove();
        });

        // 添加添加模型提供商事件监听器
        document.querySelector(`.add-model-provider[data-model-index="${modelCount}"]`).addEventListener('click', function() {
            addModelProvider(this.getAttribute('data-model-index'));
        });

        // 添加删除模型提供商事件监听器
        document.querySelector(`.remove-model-provider[data-model-index="${modelCount}"][data-provider-index="0"]`).addEventListener('click', function() {
            const modelProviders = document.querySelectorAll(`#model-providers-${this.getAttribute('data-model-index')} .model-provider`);
            if (modelProviders.length > 1) {
                this.closest('.model-provider').remove();
            } else {
                alert(t('min_model_provider'));
            }
        });

        // 添加折叠/展开事件监听器
        initCollapsibleListeners();

        modelCount++;
    });

    // 初始化折叠监听器
    function initCollapsibleListeners() {
        document.querySelectorAll('.collapsible-header').forEach(header => {
            if (!header.hasAttribute('data-listener-added')) {
                header.setAttribute('data-listener-added', 'true');
                header.addEventListener('click', function() {
                    const content = this.nextElementSibling;
                    if (content && content.classList.contains('collapsible-content')) {
                        this.classList.toggle('collapsed');
                        content.classList.toggle('collapsed');

                        // 更新图标
                        const icon = this.querySelector('.collapse-icon');
                        if (icon) {
                            if (content.classList.contains('collapsed')) {
                                icon.classList.remove('fa-chevron-down');
                                icon.classList.add('fa-chevron-right');
                            } else {
                                icon.classList.remove('fa-chevron-right');
                                icon.classList.add('fa-chevron-down');
                            }
                        }
                    }
                });
            }
        });
    }

    // 更新提供商标题
    window.updateProviderTitle = function(index, value) {
        const titleElement = document.getElementById(`provider-title-${index}`);
        if (titleElement) {
            titleElement.textContent = value || `${t('config_provider_name')} ${index}`;
        }
    };

    // 更新模型标题
    window.updateModelTitle = function(index, value) {
        const titleElement = document.getElementById(`model-title-${index}`);
        if (titleElement) {
            titleElement.textContent = value || `${t('config_model_name')} ${index}`;
        }
    };

    // 更新模型提供商标题
    window.updateModelProviderTitle = function(modelIndex, providerIndex, value) {
        const titleElement = document.getElementById(`model-provider-title-${modelIndex}-${providerIndex}`);
        if (titleElement) {
            titleElement.textContent = value || `${t('config_model_provider')} ${parseInt(providerIndex) + 1}`;
        }
    };

    // 生成配置
    generateConfigBtn.addEventListener('click', function() {
        const config = generateConfig();
        configOutput.textContent = config;

        // 高亮显示代码
        if (window.hljs) {
            hljs.highlightElement(configOutput);
        }
    });

    // 复制配置
    copyConfigBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(configOutput.textContent).then(() => {
            const originalIcon = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i>';

            setTimeout(() => {
                this.innerHTML = originalIcon;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy config: ', err);
        });
    });

    // 下载配置文件
    downloadConfigBtn.addEventListener('click', function() {
        const config = configOutput.textContent;
        const blob = new Blob([config], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wrangler-config.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // 重置表单
    resetFormBtn.addEventListener('click', function() {
        providersContainer.innerHTML = `
            <div class="provider-form">
                <div class="collapsible-header" data-listener-added="true">
                    <span class="provider-title" id="provider-title-0">${t('config_provider_name')} 0</span>
                    <i class="fas fa-chevron-down collapse-icon"></i>
                </div>
                <div class="collapsible-content">
                    <div class="form-group">
                        <label for="provider-name-0" data-i18n="config_provider_name">${t('config_provider_name')}</label>
                        <input type="text" id="provider-name-0" data-i18n="config_provider_name_placeholder" placeholder="${t('config_provider_name_placeholder')}" oninput="updateProviderTitle(0, this.value)">
                    </div>
                    <div class="form-group">
                        <label for="provider-base-url-0" data-i18n="config_base_url">${t('config_base_url')}</label>
                        <input type="text" id="provider-base-url-0" data-i18n="config_base_url_placeholder" placeholder="${t('config_base_url_placeholder')}">
                    </div>
                    <div class="form-group">
                        <label for="provider-api-keys-0" data-i18n="config_api_keys">${t('config_api_keys')}</label>
                        <textarea id="provider-api-keys-0" data-i18n="config_api_keys_placeholder" placeholder="${t('config_api_keys_placeholder')}"></textarea>
                    </div>
                    <button type="button" class="btn btn-danger remove-provider" data-index="0" data-i18n="btn_remove">${t('btn_remove')}</button>
                </div>
            </div>
        `;

        modelsContainer.innerHTML = `
            <div class="model-form">
                <div class="collapsible-header" data-listener-added="true">
                    <span class="model-title" id="model-title-0">${t('config_model_name')} 0</span>
                    <i class="fas fa-chevron-down collapse-icon"></i>
                </div>
                <div class="collapsible-content">
                    <div class="form-group">
                        <label for="model-name-0" data-i18n="config_model_name">${t('config_model_name')}</label>
                        <input type="text" id="model-name-0" data-i18n="config_model_name_placeholder" placeholder="${t('config_model_name_placeholder')}" oninput="updateModelTitle(0, this.value)">
                    </div>
                    <div class="model-providers" id="model-providers-0">
                        <div class="model-provider">
                            <div class="collapsible-header" data-listener-added="true">
                                <span class="provider-title" id="model-provider-title-0-0">${t('config_model_provider')} 1</span>
                                <i class="fas fa-chevron-down collapse-icon"></i>
                            </div>
                            <div class="collapsible-content">
                                <div class="form-group">
                                    <label for="model-provider-name-0-0" data-i18n="config_model_provider">${t('config_model_provider')}</label>
                                    <select id="model-provider-name-0-0" class="provider-select" onchange="updateModelProviderTitle(0, 0, this.value)">
                                        <option value="" data-i18n="config_select_provider">${t('config_select_provider')}</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="model-provider-model-0-0" data-i18n="config_provider_model">${t('config_provider_model')}</label>
                                    <input type="text" id="model-provider-model-0-0" data-i18n="config_provider_model_placeholder" placeholder="${t('config_provider_model_placeholder')}">
                                </div>
                                <button type="button" class="btn btn-danger remove-model-provider" data-model-index="0" data-provider-index="0" data-i18n="btn_remove">${t('btn_remove')}</button>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="btn btn-secondary add-model-provider" data-model-index="0" data-i18n="btn_add_model_provider">${t('btn_add_model_provider')}</button>
                    <button type="button" class="btn btn-danger remove-model" data-index="0" data-i18n="btn_remove">${t('btn_remove')}</button>
                </div>
            </div>
        `;

        serviceApiKeyInput.value = '';
        configOutput.textContent = t('config_preview_placeholder');

        // 重置计数器
        providerCount = 1;
        modelCount = 1;

        // 重新添加事件监听器
        updateEventListeners();
        updateProviderSelects();
        initCollapsibleListeners();
    });

    // 生成随机 API 密钥
    generateApiKeyBtn.addEventListener('click', function() {
        const randomKey = 'sk-' + Array.from(crypto.getRandomValues(new Uint8Array(24)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        serviceApiKeyInput.value = randomKey;
    });

    // 初始化事件监听器
    updateEventListeners();

    // 初始化折叠监听器
    initCollapsibleListeners();

    // 全部折叠/展开按钮
    if (collapseAllBtn) {
        collapseAllBtn.addEventListener('click', function() {
            document.querySelectorAll('.collapsible-content').forEach(content => {
                content.classList.add('collapsed');
                const header = content.previousElementSibling;
                if (header && header.classList.contains('collapsible-header')) {
                    header.classList.add('collapsed');
                    const icon = header.querySelector('.collapse-icon');
                    if (icon) {
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-right');
                    }
                }
            });
        });
    }

    if (expandAllBtn) {
        expandAllBtn.addEventListener('click', function() {
            document.querySelectorAll('.collapsible-content').forEach(content => {
                content.classList.remove('collapsed');
                const header = content.previousElementSibling;
                if (header && header.classList.contains('collapsible-header')) {
                    header.classList.remove('collapsed');
                    const icon = header.querySelector('.collapse-icon');
                    if (icon) {
                        icon.classList.remove('fa-chevron-right');
                        icon.classList.add('fa-chevron-down');
                    }
                }
            });
        });
    }

    // 获取提供商选项
    function getProviderOptions() {
        let options = `<option value="" data-i18n="config_select_provider">${t('config_select_provider')}</option>`;
        const providerInputs = document.querySelectorAll('[id^="provider-name-"]');

        providerInputs.forEach(input => {
            const providerName = input.value.trim();
            if (providerName) {
                options += `<option value="${providerName}">${providerName}</option>`;
            }
        });

        return options;
    }

    // 更新提供商选择列表
    function updateProviderSelects() {
        const providerSelects = document.querySelectorAll('.provider-select');
        const options = getProviderOptions();

        providerSelects.forEach(select => {
            const selectedValue = select.value;
            select.innerHTML = options;

            if (selectedValue) {
                const optionExists = Array.from(select.options).some(option => option.value === selectedValue);
                if (optionExists) {
                    select.value = selectedValue;
                }
            }
        });
    }

    // 添加模型提供商
    function addModelProvider(modelIndex) {
        const modelProviders = document.getElementById(`model-providers-${modelIndex}`);
        const providerCount = modelProviders.querySelectorAll('.model-provider').length;

        const providerHtml = `
            <div class="model-provider">
                <div class="collapsible-header collapsed">
                    <span class="provider-title" id="model-provider-title-${modelIndex}-${providerCount}">${t('config_model_provider')} ${providerCount + 1}</span>
                    <i class="fas fa-chevron-right collapse-icon"></i>
                </div>
                <div class="collapsible-content collapsed">
                    <div class="form-group">
                        <label for="model-provider-name-${modelIndex}-${providerCount}" data-i18n="config_model_provider">${t('config_model_provider')}</label>
                        <select id="model-provider-name-${modelIndex}-${providerCount}" class="provider-select" onchange="updateModelProviderTitle(${modelIndex}, ${providerCount}, this.value)">
                            <option value="" data-i18n="config_select_provider">${t('config_select_provider')}</option>
                            ${getProviderOptions()}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="model-provider-model-${modelIndex}-${providerCount}" data-i18n="config_provider_model">${t('config_provider_model')}</label>
                        <input type="text" id="model-provider-model-${modelIndex}-${providerCount}" data-i18n="config_provider_model_placeholder" placeholder="${t('config_provider_model_placeholder')}">
                    </div>
                    <button type="button" class="btn btn-danger remove-model-provider" data-model-index="${modelIndex}" data-provider-index="${providerCount}" data-i18n="btn_remove">${t('btn_remove')}</button>
                </div>
            </div>
        `;

        modelProviders.insertAdjacentHTML('beforeend', providerHtml);

        // 添加删除模型提供商事件监听器
        document.querySelector(`.remove-model-provider[data-model-index="${modelIndex}"][data-provider-index="${providerCount}"]`).addEventListener('click', function() {
            this.closest('.model-provider').remove();
        });

        // 添加折叠/展开事件监听器
        initCollapsibleListeners();
    }

    // 更新事件监听器
    function updateEventListeners() {
        // 删除提供商事件监听器
        document.querySelectorAll('.remove-provider').forEach(btn => {
            btn.addEventListener('click', function() {
                const providerForms = document.querySelectorAll('.provider-form');
                if (providerForms.length > 1) {
                    this.closest('.provider-form').remove();
                    updateProviderSelects();
                } else {
                    alert(t('min_provider'));
                }
            });
        });

        // 删除模型事件监听器
        document.querySelectorAll('.remove-model').forEach(btn => {
            btn.addEventListener('click', function() {
                const modelForms = document.querySelectorAll('.model-form');
                if (modelForms.length > 1) {
                    this.closest('.model-form').remove();
                } else {
                    alert(t('min_model'));
                }
            });
        });

        // 添加模型提供商事件监听器
        document.querySelectorAll('.add-model-provider').forEach(btn => {
            btn.addEventListener('click', function() {
                addModelProvider(this.getAttribute('data-model-index'));
            });
        });

        // 删除模型提供商事件监听器
        document.querySelectorAll('.remove-model-provider').forEach(btn => {
            btn.addEventListener('click', function() {
                const modelIndex = this.getAttribute('data-model-index');
                const modelProviders = document.querySelectorAll(`#model-providers-${modelIndex} .model-provider`);
                if (modelProviders.length > 1) {
                    this.closest('.model-provider').remove();
                } else {
                    alert(t('min_model_provider'));
                }
            });
        });

        // 提供商名称变更事件监听器
        document.querySelectorAll('[id^="provider-name-"]').forEach(input => {
            input.addEventListener('input', updateProviderSelects);
        });
    }

    // 生成配置
    function generateConfig() {
        // 获取提供商配置
        const providerConfig = {};
        const providerForms = document.querySelectorAll('.provider-form');

        providerForms.forEach((form, index) => {
            const nameInput = form.querySelector(`[id^="provider-name-"]`);
            const baseUrlInput = form.querySelector(`[id^="provider-base-url-"]`);
            const apiKeysInput = form.querySelector(`[id^="provider-api-keys-"]`);

            if (nameInput && baseUrlInput && apiKeysInput) {
                const name = nameInput.value.trim();
                const baseUrl = baseUrlInput.value.trim();
                const apiKeys = apiKeysInput.value.trim().split('\n').filter(key => key.trim() !== '');

                if (name && baseUrl && apiKeys.length > 0) {
                    providerConfig[name] = {
                        base_url: baseUrl,
                        api_keys: apiKeys
                    };
                }
            }
        });

        // 获取模型配置
        const modelProviderConfig = {};
        const modelForms = document.querySelectorAll('.model-form');

        modelForms.forEach((form, index) => {
            const nameInput = form.querySelector(`[id^="model-name-"]`);

            if (nameInput) {
                const modelName = nameInput.value.trim();

                if (modelName) {
                    const providers = [];
                    const modelProviders = form.querySelectorAll('.model-provider');

                    modelProviders.forEach((providerForm, providerIndex) => {
                        const providerSelect = providerForm.querySelector(`[id^="model-provider-name-"]`);
                        const modelInput = providerForm.querySelector(`[id^="model-provider-model-"]`);

                        if (providerSelect && modelInput) {
                            const providerName = providerSelect.value;
                            const providerModel = modelInput.value.trim();

                            if (providerName && providerModel) {
                                providers.push({
                                    provider: providerName,
                                    model: providerModel
                                });
                            }
                        }
                    });

                    if (providers.length > 0) {
                        modelProviderConfig[modelName] = {
                            providers: providers
                        };
                    }
                }
            }
        });

        // 获取服务 API 密钥
        const serviceApiKey = serviceApiKeyInput.value.trim() || 'your-service-api-key';

        // 生成配置文件内容
        return `const providerConfig = ${JSON.stringify(providerConfig, null, 2)};

const modelProviderConfig = ${JSON.stringify(modelProviderConfig, null, 2)};

// API keys
const serviceApiKey = '${serviceApiKey}';

// Main configuration object
// ========================
const config = {
  $schema: 'node_modules/wrangler/config-schema.json',
  name: 'apex-ai-proxy',
  main: 'src/index.ts',
  compatibility_date: '2025-02-14',
  observability: {
    enabled: true,
  },
  vars: {
    PROVIDER_CONFIG: JSON.stringify(providerConfig),
    MODEL_PROVIDER_CONFIG: JSON.stringify(modelProviderConfig),
    SERVICE_API_KEY: serviceApiKey,
  },
};

// Convert the config to a JSON string with proper formatting
const configJson = JSON.stringify(config, null, 2);

// Export the config objects and JSON string
module.exports = {
  // Original JavaScript objects
  modelProviderConfig,
  providerConfig,
  config,
  // JSON string for wrangler.jsonc
  configJson,
  serviceApiKey,
};

// Usage:
// 1. Edit this file to define your configuration
// 2. Run the update-wrangler-config.js script to update wrangler.jsonc:
//    node update-wrangler-config.js
`;
    }
}

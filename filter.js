// Sub-Store 标准单订阅清洗脚本
// 检查并提取节点列表
let list = [];
if (typeof $nodes !== 'undefined' && Array.isArray($nodes)) {
    list = $nodes;
} else if (typeof proxies !== 'undefined' && Array.isArray(proxies)) {
    list = proxies;
} else if (typeof $in !== 'undefined' && Array.isArray($in)) {
    list = $in;
} else if (typeof $in !== 'undefined' && $in.proxies && Array.isArray($in.proxies)) {
    list = $in.proxies;
}

// 如果没有拿到列表，直接返回空，避免报错
if (!Array.isArray(list) || list.length === 0) {
    return $nodes || proxies || [];
}

// 执行过滤：剔除电报群、日期、免费提示等垃圾节点
const filtered = list.filter(node => {
    if (!node || !node.name) return true;
    const name = String(node.name).trim();
    
    if (/(群|电报|tg|telegram|更新|日期|免费VPN)/i.test(name)) {
        return false;
    }
    return true;
});

// 如果过滤完不为空，则返回过滤后的结果；否则返回原列表防报错
return filtered.length > 0 ? filtered : list;

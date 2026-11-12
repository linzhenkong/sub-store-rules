// Sub-Store 云端高级清洗与过滤脚本（增强失效特征拦截）
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

if (!Array.isArray(list) || list.length === 0) {
    return $nodes || proxies || [];
}

// 1. 垃圾、广告、推广关键词黑名单
const excludeNameRegex = /(到期|剩余|流量|官网|网址|联系|发布页|客服|重置|过期|测速|群|Telegram|TG|VIP|电报|更新|日期|免费VPN|free-nodes)/i;
// 2. 明确的错误、离线、失效特征字眼
const excludeErrorRegex = /(timeout|error|403|forbidden|blocked|1016|failed|refused|unreachable|0ms|nan|offline|down)/i;
// 3. 回国节点黑名单
const excludeReturnRegex = /(回国|大陆专用|解锁CN|学术|教育网)/i;

const filtered = list.filter(node => {
    if (!node || !node.name) return true;

    const name = String(node.name).trim();
    const server = String(node.server || '').trim();

    // 【拦截规则 A】IPv6 过滤
    if (server.includes('[') || (server.match(/:/g) || []).length >= 2 || /ipv6/i.test(name)) {
        return false;
    }

    // 【拦截规则 B】名称黑名单过滤（广告、错误提示、回国线路）
    if (excludeNameRegex.test(name) || excludeErrorRegex.test(name) || excludeReturnRegex.test(name)) {
        return false;
    }

    // 【拦截规则 C】服务器地址异常拦截
    // 如果 server 地址为空、包含本地回环、或者明显是无效占位符，直接剔除
    if (!server || server === '127.0.0.1' || server === 'localhost' || server.includes('0.0.0.0')) {
        return false;
    }

    // 【拦截规则 D】历史延迟（若存在）超标拦截
    if (typeof node.delay !== 'undefined' && node.delay !== null) {
        const delay = Number(node.delay);
        if (isNaN(delay) || delay <= 0 || delay > 400) {
            return false;
        }
    }

    // 【拦截规则 E】针对特定协议的死参数拦截（例如端口异常）
    // 如果端口为 0 或明显非法，直接剔除
    if (node.port && (Number(node.port) <= 0 || Number(node.port) > 65535)) {
        return false;
    }

    return true;
});

// 防全空保护
return filtered.length > 0 ? filtered : list;

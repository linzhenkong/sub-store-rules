// Sub-Store 终极清洗与过滤脚本（全功能增强版）
let list = [];

// 1. 兼容获取节点数据
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

// 2. 定义过滤规则正则
const excludeNameRegex = /(到期|剩余|流量|官网|网址|联系|发布页|客服|重置|过期|测速|群|Telegram|TG|VIP|电报|更新|日期|免费VPN|free-nodes)/i;
const excludeErrorRegex = /(timeout|error|403|forbidden|blocked|1016|failed|refused|unreachable|0ms|nan)/i;
const excludeReturnRegex = /(回国|大陆专用|解锁CN|学术|教育网)/i;

const filtered = list.filter(node => {
    if (!node || !node.name) return true;

    const name = String(node.name).trim();
    const server = String(node.server || '').trim();

    // IPv6 过滤
    if (server.includes('[') || (server.match(/:/g) || []).length >= 2 || /ipv6/i.test(name)) {
        return false;
    }

    // 广告、错误、回国关键词过滤
    if (excludeNameRegex.test(name) || excludeErrorRegex.test(name) || excludeReturnRegex.test(name)) {
        return false;
    }

    return true;
});

// 防全空保护
return filtered.length > 0 ? filtered : list;

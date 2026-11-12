// Sub-Store 终极清洗与过滤脚本（增强测速与超时剔除）
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

const excludeNameRegex = /(到期|剩余|流量|官网|网址|联系|发布页|客服|重置|过期|测速|群|Telegram|TG|VIP|电报|更新|日期|免费VPN|free-nodes)/i;
const excludeErrorRegex = /(timeout|error|403|forbidden|blocked|1016|failed|refused|unreachable|0ms|nan)/i;
const excludeReturnRegex = /(回国|大陆专用|解锁CN|学术|教育网)/i;

const filtered = list.filter(node => {
    if (!node || !node.name) return true;

    const name = String(node.name).trim();
    const server = String(node.server || '').trim();

    // 1. IPv6 过滤
    if (server.includes('[') || (server.match(/:/g) || []).length >= 2 || /ipv6/i.test(name)) {
        return false;
    }

    // 2. 广告、错误、回国关键词过滤
    if (excludeNameRegex.test(name) || excludeErrorRegex.test(name) || excludeReturnRegex.test(name)) {
        return false;
    }

    // 3. 【严格延迟过滤】
    // 如果节点包含历史延迟数据，进行检查：
    if (typeof node.delay !== 'undefined' && node.delay !== null) {
        const delay = Number(node.delay);
        // 延迟大于 400ms，或者等于 0（代表测速失败/超时），直接剔除
        if (isNaN(delay) || delay <= 0 || delay > 400) {
            return false;
        }
    } else {
        // 【核心优化】：如果刚拉取时还没有延迟数据（多见于未测速的新节点），
        // 默认保留它们让客户端后续测速；如果你希望极其严格、没测过速的也直接过滤，
        // 可以把下面这行 return false 解开注释。当前策略是：有明确延迟且大于400的才杀。
        // return false; 
    }

    return true;
});

return filtered.length > 0 ? filtered : list;

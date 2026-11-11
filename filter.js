/**
 * Sub-Store 节点清洗与过滤脚本（强制执行稳定版）
 */
(() => {
    // 兼容 Sub-Store 不同的入参变量 ($nodes 或 proxies)
    let rawList = [];
    let isClashObj = false;

    if (typeof $nodes !== 'undefined') {
        rawList = $nodes;
    } else if (typeof proxies !== 'undefined') {
        rawList = proxies;
    } else {
        return;
    }

    // 如果是 Clash 对象结构 { proxies: [...] }
    if (!Array.isArray(rawList) && rawList && Array.isArray(rawList.proxies)) {
        isClashObj = true;
        rawList = rawList.proxies;
    }

    if (!Array.isArray(rawList)) {
        return;
    }

    // 正则定义
    const excludeNameRegex = /(到期|剩余|流量|官网|网址|联系|发布页|客服|重置|过期|测速|群|Telegram|TG|VIP)/i;
    const excludeErrorRegex = /(timeout|error|403|forbidden|blocked|1016|failed|refused|unreachable|0ms|nan)/i;
    const excludeReturnRegex = /(回国|大陆专用|解锁CN|学术|教育网)/i;

    const filtered = rawList.filter(node => {
        if (!node || !node.name) return false;

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

        // 3. 延迟过滤 (>400ms 或 <=0 的剔除)
        if (typeof node.delay !== 'undefined' && node.delay !== null) {
            const delay = Number(node.delay);
            if (!isNaN(delay) && (delay <= 0 || delay > 400)) {
                return false;
            }
        }

        return true;
    });

    // 写回数据
    if (isClashObj) {
        proxies.proxies = filtered;
    } else if (typeof $nodes !== 'undefined') {
        $nodes = filtered;
    } else if (typeof proxies !== 'undefined') {
        proxies = filtered;
    }
})();

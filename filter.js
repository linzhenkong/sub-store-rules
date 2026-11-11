/**
 * Sub-Store 节点高级清洗与过滤脚本（增强版）
 * 
 * 功能说明：
 * 1. 自动过滤无效/结构损坏的节点
 * 2. 自动过滤带有提示性文案的节点（如：剩余流量、到期时间、官网广告等）
 * 3. 自动过滤包含特定失效特征（如：timeout、error、403、被墙、0ms等）的节点
 * 4. 自动过滤延迟大于 400ms 或异常的节点
 * 5. 自动过滤 IPv6 节点（服务器地址为 IPv6 或名称中带 ipv6 特征）
 * 6. 【新增】自动过滤“回国”或大陆流媒体解锁等不需要的节点类型
 */

function isIPv6(str) {
    if (!str) return false;
    // 匹配带有方括号的 IPv6 形式如 [2001:db8::1] 或标准的 8 段 IPv6 简写
    const ipv6Regex = /([a-fA-F0-9]{1,4}(?::[a-fA-F0-9]{1,4}){1,7}|::)/;
    // 确保至少包含 2 个以上的冒号且符合十六进制特征，避免误伤普通 IPv4 或名称
    const colonCount = (str.match(/:/g) || []).length;
    return colonCount >= 2 && ipv6Regex.test(str);
}

function filterNodes(nodes) {
    // 1. 垃圾/广告/提示文案关键词正则（含常见套餐提示）
    const excludeNameRegex = /(到期|剩余|流量|官网|网址|联系|发布页|客服|重置|过期|测速|群|Telegram|TG|VIP)/i;

    // 2. 被墙/失败/报错特征关键词正则
    const excludeErrorRegex = /(timeout|error|403|forbidden|blocked|1016|failed|refused|unreachable|0ms|nan)/i;

    // 3. 【新增】回国及特定不需要的节点关键词正则（如：回国、CN、大陆专属等）
    const excludeReturnRegex = /(回国|大陆专用|解锁CN|学术|教育网)/i;

    return nodes.filter(node => {
        // 校验 1：节点结构与名称有效性
        if (!node || !node.name) {
            return false;
        }

        const name = node.name.trim();
        const server = (node.server || '').trim();

        // 校验 2：过滤 IPv6 地址或名称中带 IPv6 特征的节点
        if (isIPv6(server) || /ipv6/i.test(name)) {
            return false;
        }

        // 校验 3：是否命中无用节点/广告关键词
        if (excludeNameRegex.test(name)) {
            return false;
        }

        // 校验 4：如果节点名称中带有报错信息，进行过滤
        if (excludeErrorRegex.test(name)) {
            return false;
        }

        // 校验 5：【新增】过滤“回国”类节点
        if (excludeReturnRegex.test(name)) {
            return false;
        }

        // 校验 6：严格限制延迟 (delay <= 0 或大于 400ms 的直接剔除)
        if (typeof node.delay !== 'undefined') {
            const delay = Number(node.delay);
            if (isNaN(delay) || delay <= 0 || delay > 400) {
                return false;
            }
        }

        return true;
    });
}

// Sub-Store 脚本入口逻辑
if (typeof $nodes !== 'undefined') {
    $nodes = filterNodes($nodes);
}

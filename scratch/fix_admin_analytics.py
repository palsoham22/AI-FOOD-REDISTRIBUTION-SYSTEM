import os

filepath = 'frontend/src/pages/AdminAnalytics.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''                                        <Tooltip
                                            contentStyle={tooltipContentStyle}
                                            itemStyle={tooltipItemStyle}
                                            formatter={(value) => [
                                                formatLocalizedNumber(value, language),
                                                t("Items")
                                            ]}
                                        />'''

replacement = '''                                        <Tooltip
                                            contentStyle={tooltipContentStyle}
                                            itemStyle={tooltipItemStyle}
                                            formatter={(value) => {
                                                const pct = totalCategoryItems > 0
                                                    ? ` (${Math.round((value / totalCategoryItems) * 100)}%)`
                                                    : "";
                                                return [
                                                    `${formatLocalizedNumber(value, language)}${pct}`,
                                                    t("Items")
                                                ];
                                            }}
                                        />'''

if target not in content:
    print('Target not found!')
    exit(1)

new_content = content.replace(target, replacement, 1)
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)
    f.flush()
    os.fsync(f.fileno())

print('Successfully fixed AdminAnalytics.js with flush & fsync')


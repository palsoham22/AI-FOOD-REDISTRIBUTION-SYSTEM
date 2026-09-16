export function buildDynamicLabels(labels, items, fields) {

    return [

        ...new Set([

            ...labels,

            ...items.flatMap(item =>

                fields.map(field => item[field])

            )

        ])

    ].filter(

        text =>

            text &&
            String(text).trim() !== ""

    );

}
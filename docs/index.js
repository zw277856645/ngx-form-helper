window.$docsify = {
    loadSidebar: true,
    subMaxLevel: 3,
    coverpage: true,
    auto2top: true,
    homepage: 'form-helper.md',
    repo: 'https://gitlab.com/zw277856645/ngx-form-helper',
    markdown: {
        renderer: {
            code: function (code, lang) {
                if (lang === "mermaid") {
                    return (
                        '<div class="mermaid">' + mermaid.render(lang, code) + "</div>"
                    );
                }

                return this.origin.code.apply(this, arguments);
            }
        }
    }
};
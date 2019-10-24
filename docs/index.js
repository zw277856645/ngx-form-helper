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
    },
    plugins: [
        DemoBoxAngular.create({
            project: {
                dependencies: {
                    "@types/jquery": "2.0.43",
                    "@types/semantic-ui": "2.2.0",
                    "@angular/forms": "8.1.2",
                    "@angular/router": "8.1.2",
                    "cmjs-lib": "0.7.1",
                    "ngx-form-helper": "3.0.14",
                    "moment": "2.18.1",
                    "jquery": "3.2.1",
                    "semantic-ui-css": "2.4.1",
                    "ngx-chips": "2.0.0-beta.0",
                    "ngx-textarea-auto-height": "0.0.2"
                }
            },
            extraModules: {
                "ReactiveFormsModule": "@angular/forms",
                "FormsModule": "@angular/forms",
                "TagInputModule": "ngx-chips",
                "FormHelperModule": "ngx-form-helper",
                "TextareaAutoHeightModule": "ngx-textarea-auto-height"
            }
        })
    ]
};
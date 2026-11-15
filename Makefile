.PHONY: download-monaco-deps clean bump-patch bump-minor bump-major tag-release

MONACO_FILES = \
	public/assets/wasm_exec.js \
	public/assets/xray.schema.json \
	public/assets/xray.schema.cn.json \
	public/assets/main.wasm

download-monaco-deps: $(MONACO_FILES)

# The app loads these from /assets/ (src/config.ts). The release is private, so fetch it with gh, not curl.
$(MONACO_FILES):
	@mkdir -p public/assets
	gh release download assets-1 --repo therewasluna/umiji --dir public/assets --pattern $(notdir $@) --clobber

clean:
	rm -f $(MONACO_FILES)

bump-patch:
	npm version patch --no-git-tag-version
	npm install

bump-minor:
	npm version minor --no-git-tag-version
	npm install

bump-major:
	npm version major --no-git-tag-version
	npm install

tag-release:
	@VERSION=$$(node -p "require('./package.json').version") && \
	echo "Creating signed tag for version $$VERSION..." && \
	git tag -s "$$VERSION" -m "Release $$VERSION" && \
	git push origin --follow-tags && \
	echo "Signed tag $$VERSION created and pushed"
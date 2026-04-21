# peptidebro-site

Static site for `peptidebro.app`. Required for App Store review (Privacy + Terms URLs).

## Deploy to GitHub Pages

```bash
cd ~/peptidebro-site
git init && git add -A && git commit -m "initial site"
gh repo create peptidebro-site --public --source . --push
# In repo Settings → Pages: source = main branch, root
# Add CNAME file with contents: peptidebro.app
echo "peptidebro.app" > CNAME && git add CNAME && git commit -m "add CNAME" && git push
```

## Point the domain

Once you register `peptidebro.app` (Cloudflare/Namecheap):

1. Create four **A records** for the apex (@):
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
2. Create a **CNAME** for `www` → `<your-gh-username>.github.io`.
3. Wait 10–60 min for DNS propagation.
4. In repo Settings → Pages, tick "Enforce HTTPS" once the cert provisions.

## Smoke test before submitting to App Review

Apple's reviewer **will click these URLs**. Make sure they resolve:

- `https://peptidebro.app/` → Home
- `https://peptidebro.app/privacy.html` → Privacy Policy
- `https://peptidebro.app/terms.html` → Terms of Use

If any 404, the app gets rejected.

## Local preview

Plain HTML, no build. Just open `index.html` in a browser, or:

```bash
python3 -m http.server --directory ~/peptidebro-site 8000
# then visit http://localhost:8000
```

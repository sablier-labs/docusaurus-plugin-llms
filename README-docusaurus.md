# Configuring Redirects

It is recommended to configure redirects so that LLMs can use addresses with both `.md` and `.txt` extensions.

## Using Docusaurus client redirects

You can create client-side redirects using the `createRedirects` function in your `docusaurus.config.js`:

```js
module.exports = {
  // ... your existing Docusaurus config

  plugins: [
    'docusaurus-plugin-llms',
    // ... your other plugins
  ],

  // Configure client redirects for LLM files
  async function createRedirects(config) {
    return [
      {
        from: '/llms-full.md',
        to: '/llms-full.txt',
      },
      {
        from: '/llms.md',
        to: '/llms.txt',
      },
      // Add redirects for any other specific LLM-friendly files you want to make accessible
    ];
  },
};
```

## Netlify

If you're hosting on Netlify, you can create a `_redirects` file in your `static` directory:

```
/llms-full.md    /llms-full.txt 200!
/llms-full.txt   /llms-full.txt 200!
/llms.md         /llms.txt 200!
/llms.txt        /llms.txt 200!
```

## Vercel

If you're hosting on Vercel, you can define redirects in a `vercel.json` file in your project root:

```json
{
  "redirects": [
    { "source": "/llms-full.md", "destination": "/llms-full.txt", "statusCode": 200 },
    { "source": "/llms.md", "destination": "/llms.txt", "statusCode": 200 }
  ]
}
```

## Apache

If you're using Apache, you can use a `.htaccess` file:

```apache
RewriteEngine On
RewriteRule ^llms-full\.md$ llms-full.txt [L,R=301]
RewriteRule ^llms\.md$ llms.txt [L,R=301]
```

## Nginx

If you're using Nginx, you can add to your server configuration:

```nginx
location = /llms-full.md {
  return 301 /llms-full.txt;
}

location = /llms.md {
  return 301 /llms.txt;
}
```

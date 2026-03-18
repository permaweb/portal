export const ASSET_UPLOAD = {
	ansType: 'blog-post',
	contentType: 'text/html',
};

export const PortalPatchMapEnum = Object.freeze({
	Overview: 'overview',
	Users: 'users',
	Navigation: 'navigation',
	Presentation: 'presentation',
	Media: 'media',
	Posts: 'posts',
	Requests: 'requests',
	Transfers: 'transfers',
	Monetization: 'monetization',
});

export const PORTAL_PATCH_MAP = {
	[PortalPatchMapEnum.Overview]: [
		'Owner',
		'Version',
		'Authorities',
		'PatchMap',
		'Store.Name',
		'Store.Description',
		'Store.Thumbnail',
		'Store.Banner',
		'Store.Wallpaper',
		'Store.Moderation',
	],
	[PortalPatchMapEnum.Users]: ['Roles', 'RoleOptions', 'Permissions'],
	[PortalPatchMapEnum.Navigation]: ['Store.Categories', 'Store.Topics', 'Store.Links', 'Store.Domains'],
	[PortalPatchMapEnum.Presentation]: [
		'Store.Layout',
		'Store.Pages',
		'Store.Themes',
		'Store.Fonts',
		'Store.PostPreviews',
	],
	[PortalPatchMapEnum.Media]: ['Store.Uploads'],
	[PortalPatchMapEnum.Posts]: ['Store.Index'],
	[PortalPatchMapEnum.Requests]: ['Store.IndexRequests'],
	[PortalPatchMapEnum.Transfers]: ['Transfers'],
	[PortalPatchMapEnum.Monetization]: ['Store.Monetization'],
};

export const PORTAL_ROLES = {
	ADMIN: 'Admin',
	CONTRIBUTOR: 'Contributor',
	MODERATOR: 'Moderator',
	GUEST_CONTRIBUTOR: 'Guest Contributor',
};

export const PORTAL_DATA = () => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <title>Portal</title>
  </head>
  <body>
    <div id="portal"></div>
    <script type="module">
      function getGateway() {
        const host = window.location.hostname;
        const parts = host.split('.');
		return \`\${parts[parts.length - 2]}.\${parts[parts.length - 1]}\`;
      }

      const gateway = getGateway();

      const script = document.createElement('script');
      script.type = 'module';
      script.src = \`https://engine_portalenv.\${gateway}\`;
      document.body.appendChild(script);
    </script>
  </body>
</html>
`;

export const PORTAL_POST_DATA = () => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Portal Post</title>
  </head>
  <body>
    <pre id="post-content"></pre>
    <script>
      /* Checks for a valid arweave address */
      function checkValidAddress(address) {
        if (!address) return false;
        return /^[a-z0-9_-]{43}$/i.test(address);
      }

      /* Maps an object from pascal case to camel case and removes any 'commitments' key */
      function fromProcessCase(str) {
        return str.charAt(0).toLowerCase() + str.slice(1);
      }

      function mapFromProcessCase(obj) {
        if (Array.isArray(obj)) {
          return obj.map(mapFromProcessCase);
        }
        if (obj && typeof obj === "object") {
          return Object.entries(obj).reduce((acc, [key, value]) => {
            // Skip any key named "commitments" (case-insensitive)
            if (
              typeof key === "string" &&
              key.toLowerCase() === "commitments"
            ) {
              return acc;
            }

            const fromKey =
              checkValidAddress(key) || key.includes("-")
                ? key
                : fromProcessCase(key);

            acc[fromKey] = checkValidAddress(value)
              ? value
              : mapFromProcessCase(value);

            return acc;
          }, {});
        }
        return obj;
      }

      /* Basic hostname validator */
      function isValidHost(host) {
        return /^[a-zA-Z0-9.-]+$/.test(host);
      }

      (async function () {
        try {
          document.getElementById("post-content").innerHTML = "Loading...";

          const defaultNode = "hb.portalinto.com";
          const node = defaultNode;

          const processId = window.location.href.substring(
            window.location.href.lastIndexOf("/") + 1
          );

		  const url =
            "https://" +
            node +
            "/" +
            processId +
            "~process@1.0/compute?require-codec=application/json&accept-bundle=true";

          const response = await fetch(url);

          const data = mapFromProcessCase((await response.json()) ?? {});
          const content = data?.asset?.metadata?.content ?? [];

          document.getElementById("post-content").innerHTML = JSON.stringify(
            content,
            null,
            2
          );
        } catch (e) {
          console.error(e);
          document.getElementById("post-content").innerHTML = "Error occurred";
        }
      })();
    </script>
  </body>
</html>
`;

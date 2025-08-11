# Domain Setup

Domain Setup allows you to connect custom domain names to your portal, giving you a professional web presence while maintaining all the benefits of decentralized hosting on the Arweave network.

#### Key Features

- **Custom Domains**: Use your own domain name for your portal
- **Decentralized Hosting**: Maintain decentralized benefits with traditional domain access
- **Professional Branding**: Create a memorable web address for your audience
- **DNS Integration**: Connect existing domains to your Arweave portal

#### Understanding Portal Domains

**Arweave Native Access:**

- **Permanent URLs**: Your portal has a permanent Arweave address
- **Gateway Access**: Accessible through Arweave gateways
- **Immutable Hosting**: Content is permanently stored on the Arweave network
- **Global Distribution**: Available worldwide through the Arweave network

**Custom Domain Benefits:**

- **Brand Recognition**: Use your own domain for professional appearance
- **Easy Sharing**: Simple, memorable URLs for your audience
- **SEO Benefits**: Better search engine optimization with custom domains
- **Marketing Advantage**: Professional web presence for business use

#### Domain Configuration Process

**Prerequisites:**

- **Domain Ownership**: You must own or control the domain you want to use
- **DNS Access**: Ability to modify DNS records for your domain
- **Portal Setup**: Your portal must be fully configured and published

**Step 1: Domain Registration**

- **Purchase Domain**: Buy a domain from any domain registrar
- **Domain Management**: Ensure you have access to DNS settings
- **SSL Considerations**: Plan for SSL certificate requirements

**Step 2: Portal Configuration**

- **Access Domain Settings**

  - Navigate to **Domains** in the main menu
  - Select **Add Custom Domain** or **Domain Setup**

- **Enter Domain Information**
  - **Domain Name**: Enter your full domain (e.g., `myblog.com`)
  - **Subdomain Options**: Choose www or non-www preference
  - **Verification**: Follow verification steps to confirm ownership

#### DNS Configuration

**Required DNS Records:**

**CNAME Record:**

```
Name: www (or your preferred subdomain)
Type: CNAME
Value: [Your Arweave Gateway Address]
TTL: 300 (or as recommended)
```

**A Record (Alternative):**

```
Name: @ (for root domain)
Type: A
Value: [Gateway IP Address]
TTL: 300
```

**DNS Provider Examples:**

**Cloudflare:**

1. Log into Cloudflare dashboard
2. Select your domain
3. Go to DNS settings
4. Add the required records
5. Set Proxy Status to "DNS Only" initially

**Namecheap:**

1. Access Domain Management
2. Select "Advanced DNS"
3. Add new record with provided values
4. Save changes

**GoDaddy:**

1. Open DNS Management
2. Add new CNAME record
3. Enter provided values
4. Save configuration

#### SSL and Security

**SSL Certificate Setup:**

- **Automatic SSL**: Many providers offer automatic SSL
- **Let's Encrypt**: Free SSL certificates through providers
- **Custom Certificates**: Upload your own SSL certificates if needed

**Security Considerations:**

- **HTTPS Enforcement**: Ensure all traffic uses HTTPS
- **Content Security**: Maintain Arweave's security benefits
- **Domain Validation**: Regular verification of domain ownership

#### Verification and Testing

**Domain Verification:**

- **DNS Propagation**: Allow 24-48 hours for DNS changes to propagate
- **Verification Tools**: Use Portal's built-in verification system
- **Status Monitoring**: Check domain connection status regularly

**Testing Your Setup:**

- **Direct Access**: Test domain access in multiple browsers
- **Mobile Testing**: Verify mobile device compatibility
- **Link Verification**: Ensure all internal links work correctly
- **Performance Testing**: Check loading speeds and responsiveness

#### Managing Multiple Domains

**Primary Domain:**

- **Main Address**: Set your primary domain for official use
- **Redirect Setup**: Configure other domains to redirect to primary
- **Canonical URLs**: Ensure consistent URL structure

**Subdomain Strategy:**

- **Blog Subdomain**: Use `blog.yourdomain.com` for content
- **Portal Subdomain**: Use `portal.yourdomain.com` for the full portal
- **Content Subdomains**: Consider content-specific subdomains

#### Troubleshooting Domain Issues

**Common Problems:**

**DNS Not Propagating:**

- **Wait Time**: DNS changes can take up to 48 hours
- **Cache Clearing**: Clear browser and local DNS cache
- **Verification Tools**: Use online DNS propagation checkers

**SSL Certificate Issues:**

- **Mixed Content**: Ensure all resources load over HTTPS
- **Certificate Renewal**: Monitor certificate expiration dates
- **Provider Support**: Contact your DNS provider for SSL issues

**Portal Not Loading:**

- **Record Verification**: Double-check DNS record accuracy
- **Gateway Status**: Verify Arweave gateway availability
- **Proxy Settings**: Check CDN or proxy configurations

#### Advanced Domain Features

**Content Delivery:**

- **CDN Integration**: Use CDNs for improved performance
- **Geographic Optimization**: Optimize for specific regions
- **Caching Strategies**: Implement effective caching policies

**Analytics Integration:**

- **Domain Tracking**: Set up analytics for your custom domain
- **Traffic Monitoring**: Monitor domain-specific traffic patterns
- **Performance Metrics**: Track loading speeds and user engagement

#### Domain Maintenance

**Regular Tasks:**

- **DNS Monitoring**: Check DNS record integrity regularly
- **SSL Renewal**: Ensure certificates remain valid
- **Performance Review**: Monitor domain performance metrics
- **Security Audits**: Regular security assessments

**Backup Procedures:**

- **DNS Backup**: Keep records of DNS configurations
- **Certificate Backup**: Store SSL certificate copies safely
- **Configuration Documentation**: Document all domain settings

#### Cost Considerations

**Domain Costs:**

- **Registration Fees**: Annual domain registration costs
- **Renewal Fees**: Ongoing domain maintenance costs
- **Premium Domains**: Higher costs for premium domain names

**Additional Services:**

- **Privacy Protection**: Domain privacy service costs
- **Premium DNS**: Enhanced DNS service fees
- **SSL Certificates**: Certificate costs (if not free)

#### Best Practices

**Domain Selection:**

- **Brand Consistency**: Choose domains that match your brand
- **Simple and Memorable**: Easy to type and remember
- **Extension Choice**: Consider appropriate domain extensions
- **Future Planning**: Choose domains that allow for growth

**Technical Setup:**

- **Document Everything**: Keep detailed records of all configurations
- **Regular Testing**: Periodically test domain functionality
- **Monitor Performance**: Track domain-related performance metrics
- **Stay Updated**: Keep up with DNS and security best practices

Remember: Custom domains provide professional credibility while maintaining the decentralized benefits of Arweave hosting. Take time to configure everything correctly, and don't hesitate to seek help from your domain provider's support team if needed.

# 🚀 AWS S3 Setup Guide for 3GIS

## ✅ What's already implemented:
- AWS S3 client with automatic WebP conversion
- Image upload API endpoints
- React components for drag & drop upload
- Prisma integration for metadata storage
- Photo gallery with lightbox
- Business creation form with photos

## 🔧 AWS Console Setup:

### 1. Create S3 Bucket
1. Open [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Create bucket: `3gis-photos`
3. Region: `us-east-1`
4. Disable "Block all public access"

### 2. Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::3gis-photos/*"
    }
  ]
}
```

### 3. CORS Configuration
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "https://3gis.vercel.app",
      "http://localhost:3000"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

### 4. Create IAM User
1. Create user: `3gis-s3-user`
2. Attach policy with S3 permissions
3. Create Access Key

## 🔑 Environment Variables

Add to your `.env` file:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
S3_BUCKET_NAME=3gis-photos
NEXT_PUBLIC_S3_BASE_URL=https://3gis-photos.s3.us-east-1.amazonaws.com
```

⚠️ **Replace placeholders with your actual AWS credentials**

## 🧪 Testing

1. Run: `npm run dev`
2. Open: `http://localhost:3000/tg/test-s3`
3. Test image uploads
4. Verify files appear in S3 bucket

## 💰 Cost Estimate

**Free Tier (first 12 months):**
- 5 GB storage
- 20,000 GET requests
- 2,000 PUT requests

**For 3GIS MVP:** ~$0.01/month for storage

## 🚀 Features

✅ Automatic WebP conversion
✅ Image optimization and resizing
✅ Drag & drop upload interface
✅ Lightbox photo gallery
✅ Metadata storage in PostgreSQL
✅ File validation and error handling

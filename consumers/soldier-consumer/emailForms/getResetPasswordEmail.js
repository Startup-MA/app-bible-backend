export function getResetPasswordEmail(expirationTime, frontendUrl, resetPasswordLink, supportEmail) {
	return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title></title>
            <style>                
                body, table, td, a {
                    -webkit-text-size-adjust: 100%;
                    -ms-text-size-adjust: 100%;
                }
                
                table, td {
                    mso-table-lspace: 0pt;
                    mso-table-rspace: 0pt;
                }

                code {
                    width: 70%;
                }

                img {
                    -ms-interpolation-mode: bicubic;
                }

                @media screen and (max-width: 600px) {
                    .email-container {
                        width: 100% !important;
                        margin: auto !important;
                    }

                    .content-cell {
                        padding: 20px !important;
                    }
                }
            </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <div style="opacity: 0; color: transparent; height: 0; width: 0; font-size: 0px; line-height: 0px; overflow: hidden; mso-hide: all;">
                We received a requet to reset your password. Here is your password reset link. It expires in ${expirationTime} minutes.
            </div>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5; padding: 40px 20px;">
            <tr>
                <td align="center">
                
                <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                    
                    <tr>
                        <td align="center" style="padding: 32px 0 0 0;">
                            <a href="${frontendUrl}">
                                <img src="https://cdn.app-bible.com/static/LogoWhite.svg" alt="The Bible" width="170" style="display: block; max-width: 170px; height: auto;">
                            </a>
                        </td>
                    </tr>

                    <tr>
                    <td class="content-cell" style="padding: 32px; color: #3f3f46; font-size: 16px; line-height: 1.6;">
                        <h1 style="text-align: center">Reset your password</h1>
                        <p style="text-align: center; color: #868686">Click the button to reset the password for your user.</p>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr class="code">
                                <td align="center" style="padding: 8px 0 32px 0;">
                                <table border="0" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td align="center" style="border-radius: 6px; color: black;">
                                            <a href="${resetPasswordLink}" style="display: inline-block; font-size: 17px; padding: 1em; text-align: center; border-radius: 10px; background-color: black; color: white; text-decoration: none; cursor: pointer; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                                                Reset password
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                </td>
                            </tr>
                        </table>
                        <p style="text-align: center; color: #868686; margin-top: 2em;">If it wasn't you who tried to reset password, just ignore this email or contact us here: ${supportEmail}</p>
                    </td>
                    </tr>
                    <tr>
                        <td style="background-color: #fafafa; padding: 24px 32px; border-top: 1px solid #e4e4e7; text-align: center; color: #a1a1aa; font-size: 13px; line-height: 1.5;">
                            <p style="margin: 0 0 8px 0;">&copy; 2026 The Bible App. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
                </td>
            </tr>
            </table>
        </body>
        </html>
	`
}

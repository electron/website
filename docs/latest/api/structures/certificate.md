---
title: "Certificate Object"
description: ""
slug: certificate
hide_title: false
---

# Certificate Object

* `data` string - PEM encoded data
* `issuer` [CertificatePrincipal](latest/api/structures/certificate-principal.md) - Issuer principal
* `issuerName` string - Issuer's Common Name
* `issuerCert` Certificate - Issuer certificate (if not self-signed)
* `subject` [CertificatePrincipal](latest/api/structures/certificate-principal.md) - Subject principal
* `subjectName` string - Subject's Common Name
* `serialNumber` string - Hex value represented string
* `validStart` number - Start date of the certificate being valid in seconds
* `validExpiry` number - End date of the certificate being valid in seconds
* `fingerprint` string - Fingerprint of the certificate

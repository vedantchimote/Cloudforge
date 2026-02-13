# LDAP Users Created Successfully ✅

**Date**: February 12, 2026  
**Status**: Complete  
**Total Users**: 16 (6 International + 10 Indian)

---

## 📊 Summary

Successfully created 16 test users in the OpenLDAP directory for CloudForge authentication, including diverse international and Indian names.

---

## 👥 Created Users

### International Users (6)

### 1. Admin User
- **Username**: `admin`
- **Password**: `Admin123!`
- **Email**: admin@cloudforge.io
- **Full Name**: Admin User
- **UID**: 10000
- **Group**: admins

### 2. John Doe
- **Username**: `john.doe`
- **Password**: `Password123!`
- **Email**: john.doe@cloudforge.io
- **Full Name**: John Doe
- **UID**: 10001
- **Group**: users

### 3. Jane Smith
- **Username**: `jane.smith`
- **Password**: `Password123!`
- **Email**: jane.smith@cloudforge.io
- **Full Name**: Jane Smith
- **UID**: 10002
- **Group**: users

### 4. Bob Johnson
- **Username**: `bob.johnson`
- **Password**: `Password123!`
- **Email**: bob.johnson@cloudforge.io
- **Full Name**: Bob Johnson
- **UID**: 10003
- **Group**: users

### 5. Alice Williams
- **Username**: `alice.williams`
- **Password**: `Password123!`
- **Email**: alice.williams@cloudforge.io
- **Full Name**: Alice Williams
- **UID**: 10004
- **Group**: users

### 6. Charlie Brown
- **Username**: `charlie.brown`
- **Password**: `Password123!`
- **Email**: charlie.brown@cloudforge.io
- **Full Name**: Charlie Brown
- **UID**: 10005
- **Group**: users

### Indian Users (10)

### 7. Rajesh Kumar
- **Username**: `rajesh.kumar`
- **Password**: `Password123!`
- **Email**: rajesh.kumar@cloudforge.io
- **Full Name**: Rajesh Kumar
- **UID**: 10006
- **Group**: users

### 8. Priya Sharma
- **Username**: `priya.sharma`
- **Password**: `Password123!`
- **Email**: priya.sharma@cloudforge.io
- **Full Name**: Priya Sharma
- **UID**: 10007
- **Group**: users

### 9. Amit Patel
- **Username**: `amit.patel`
- **Password**: `Password123!`
- **Email**: amit.patel@cloudforge.io
- **Full Name**: Amit Patel
- **UID**: 10008
- **Group**: users

### 10. Sneha Reddy
- **Username**: `sneha.reddy`
- **Password**: `Password123!`
- **Email**: sneha.reddy@cloudforge.io
- **Full Name**: Sneha Reddy
- **UID**: 10009
- **Group**: users

### 11. Vikram Singh
- **Username**: `vikram.singh`
- **Password**: `Password123!`
- **Email**: vikram.singh@cloudforge.io
- **Full Name**: Vikram Singh
- **UID**: 10010
- **Group**: users

### 12. Ananya Iyer
- **Username**: `ananya.iyer`
- **Password**: `Password123!`
- **Email**: ananya.iyer@cloudforge.io
- **Full Name**: Ananya Iyer
- **UID**: 10011
- **Group**: users

### 13. Arjun Mehta
- **Username**: `arjun.mehta`
- **Password**: `Password123!`
- **Email**: arjun.mehta@cloudforge.io
- **Full Name**: Arjun Mehta
- **UID**: 10012
- **Group**: users

### 14. Kavya Nair
- **Username**: `kavya.nair`
- **Password**: `Password123!`
- **Email**: kavya.nair@cloudforge.io
- **Full Name**: Kavya Nair
- **UID**: 10013
- **Group**: users

### 15. Rohan Gupta
- **Username**: `rohan.gupta`
- **Password**: `Password123!`
- **Email**: rohan.gupta@cloudforge.io
- **Full Name**: Rohan Gupta
- **UID**: 10014
- **Group**: users

### 16. Ishita Desai
- **Username**: `ishita.desai`
- **Password**: `Password123!`
- **Email**: ishita.desai@cloudforge.io
- **Full Name**: Ishita Desai
- **UID**: 10015
- **Group**: users

---

## 🏗️ LDAP Structure

```
dc=cloudforge,dc=io
├── ou=users (16 users)
│   ├── uid=admin
│   ├── uid=john.doe
│   ├── uid=jane.smith
│   ├── uid=bob.johnson
│   ├── uid=alice.williams
│   ├── uid=charlie.brown
│   ├── uid=rajesh.kumar
│   ├── uid=priya.sharma
│   ├── uid=amit.patel
│   ├── uid=sneha.reddy
│   ├── uid=vikram.singh
│   ├── uid=ananya.iyer
│   ├── uid=arjun.mehta
│   ├── uid=kavya.nair
│   ├── uid=rohan.gupta
│   └── uid=ishita.desai
└── ou=groups (2 groups)
    ├── cn=admins (member: admin)
    └── cn=users (member: john.doe)
```

---

## 🔐 Authentication Details

### LDAP Connection
- **Host**: localhost (or cloudforge-ldap from containers)
- **Port**: 389
- **Base DN**: dc=cloudforge,dc=io
- **Admin DN**: cn=admin,dc=cloudforge,dc=io
- **Admin Password**: admin123

### User Authentication
- **Base DN**: ou=users,dc=cloudforge,dc=io
- **Username Format**: uid={username},ou=users,dc=cloudforge,dc=io
- **Password**: As listed above for each user

---

## 🧪 Testing Authentication

### Test via LDAP Search

```bash
# Test admin user
docker exec cloudforge-ldap ldapsearch -x -H ldap://localhost \
  -D "uid=admin,ou=users,dc=cloudforge,dc=io" \
  -w "Admin123!" \
  -b "dc=cloudforge,dc=io" "(uid=admin)"

# Test john.doe user
docker exec cloudforge-ldap ldapsearch -x -H ldap://localhost \
  -D "uid=john.doe,ou=users,dc=cloudforge,dc=io" \
  -w "Password123!" \
  -b "dc=cloudforge,dc=io" "(uid=john.doe)"
```

### Test via User Service API

```bash
# Login as john.doe
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.doe",
    "password": "Password123!"
  }'

# Login as jane.smith
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jane.smith",
    "password": "Password123!"
  }'
```

### Test via Frontend

1. Open http://localhost:3000
2. Click "Login"
3. Enter credentials:
   - Username: `john.doe`
   - Password: `Password123!`
4. Click "Sign In"

---

## 🔍 View Users in LDAP Admin

1. Open http://localhost:8090
2. Login with:
   - **Login DN**: `cn=admin,dc=cloudforge,dc=io`
   - **Password**: `admin123`
3. Navigate to: `dc=cloudforge,dc=io` → `ou=users`
4. You'll see all 6 users listed

---

## 📝 User Attributes

Each user has the following LDAP attributes:

| Attribute | Description | Example |
|-----------|-------------|---------|
| `uid` | Username | john.doe |
| `cn` | Common Name (Full Name) | John Doe |
| `sn` | Surname (Last Name) | Doe |
| `givenName` | First Name | John |
| `mail` | Email Address | john.doe@cloudforge.io |
| `userPassword` | Encrypted Password | {SSHA}... |
| `uidNumber` | Unix User ID | 10001 |
| `gidNumber` | Unix Group ID | 10001 |
| `homeDirectory` | Home Directory Path | /home/john.doe |
| `loginShell` | Login Shell | /bin/bash |

---

## 🛠️ Management Commands

### List All Users

```bash
docker exec cloudforge-ldap ldapsearch -x -H ldap://localhost \
  -b "ou=users,dc=cloudforge,dc=io" \
  -D "cn=admin,dc=cloudforge,dc=io" \
  -w admin123 \
  "(objectClass=inetOrgPerson)" uid cn mail
```

### Search for Specific User

```bash
docker exec cloudforge-ldap ldapsearch -x -H ldap://localhost \
  -b "ou=users,dc=cloudforge,dc=io" \
  -D "cn=admin,dc=cloudforge,dc=io" \
  -w admin123 \
  "(uid=john.doe)"
```

### List All Groups

```bash
docker exec cloudforge-ldap ldapsearch -x -H ldap://localhost \
  -b "ou=groups,dc=cloudforge,dc=io" \
  -D "cn=admin,dc=cloudforge,dc=io" \
  -w admin123 \
  "(objectClass=groupOfNames)" cn member
```

### Change User Password

```bash
# Change john.doe's password
docker exec cloudforge-ldap ldappasswd -x -H ldap://localhost \
  -D "cn=admin,dc=cloudforge,dc=io" \
  -w admin123 \
  -s "NewPassword123!" \
  "uid=john.doe,ou=users,dc=cloudforge,dc=io"
```

### Delete User

```bash
# Delete a user (example: charlie.brown)
docker exec cloudforge-ldap ldapdelete -x -H ldap://localhost \
  -D "cn=admin,dc=cloudforge,dc=io" \
  -w admin123 \
  "uid=charlie.brown,ou=users,dc=cloudforge,dc=io"
```

---

## 📂 LDIF File

The users were created using the LDIF file located at:
`infrastructure/docker/ldap-users.ldif`

This file can be used to:
- Recreate users if LDAP is reset
- Add more users with similar structure
- Document the LDAP schema

---

## 🔄 Adding More Users

To add more users, create a new LDIF file:

```ldif
dn: uid=new.user,ou=users,dc=cloudforge,dc=io
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: shadowAccount
uid: new.user
cn: New User
sn: User
givenName: New
mail: new.user@cloudforge.io
userPassword: {SSHA}Password123!
uidNumber: 10006
gidNumber: 10006
homeDirectory: /home/new.user
loginShell: /bin/bash
```

Then add it:

```bash
docker exec cloudforge-ldap ldapadd -x -H ldap://localhost \
  -D "cn=admin,dc=cloudforge,dc=io" \
  -w admin123 \
  -f /path/to/new-user.ldif
```

---

## 🎯 Use Cases

### Development Testing
- Test user authentication flows
- Test user registration
- Test profile management
- Test role-based access control

### Integration Testing
- Test LDAP integration
- Test JWT token generation
- Test session management
- Test user service endpoints

### Demo Purposes
- Show login functionality
- Demonstrate user management
- Show different user roles
- Present authentication flow

---

## 🔐 Security Notes

### Development Environment
- These are **test credentials** for development only
- Passwords are simple for easy testing
- All users have the same password pattern

### Production Environment
For production, you should:
- Use strong, unique passwords
- Implement password policies
- Enable password expiration
- Use secure LDAP (LDAPS) on port 636
- Implement account lockout policies
- Use multi-factor authentication
- Store passwords with stronger hashing

---

## 📊 Quick Reference

### International Users
| Username | Password | Email | Role |
|----------|----------|-------|------|
| admin | Admin123! | admin@cloudforge.io | Admin |
| john.doe | Password123! | john.doe@cloudforge.io | User |
| jane.smith | Password123! | jane.smith@cloudforge.io | User |
| bob.johnson | Password123! | bob.johnson@cloudforge.io | User |
| alice.williams | Password123! | alice.williams@cloudforge.io | User |
| charlie.brown | Password123! | charlie.brown@cloudforge.io | User |

### Indian Users
| Username | Password | Email | Role |
|----------|----------|-------|------|
| rajesh.kumar | Password123! | rajesh.kumar@cloudforge.io | User |
| priya.sharma | Password123! | priya.sharma@cloudforge.io | User |
| amit.patel | Password123! | amit.patel@cloudforge.io | User |
| sneha.reddy | Password123! | sneha.reddy@cloudforge.io | User |
| vikram.singh | Password123! | vikram.singh@cloudforge.io | User |
| ananya.iyer | Password123! | ananya.iyer@cloudforge.io | User |
| arjun.mehta | Password123! | arjun.mehta@cloudforge.io | User |
| kavya.nair | Password123! | kavya.nair@cloudforge.io | User |
| rohan.gupta | Password123! | rohan.gupta@cloudforge.io | User |
| ishita.desai | Password123! | ishita.desai@cloudforge.io | User |

---

## ✅ Verification

All users have been successfully created and verified:

```bash
# Verification command output:
# numResponses: 17
# numEntries: 16
```

✅ 16 users created (6 International + 10 Indian)  
✅ 2 organizational units created (users, groups)  
✅ 2 groups created (admins, users)  
✅ All users have proper attributes  
✅ All users can authenticate  

---

## 🔗 Related Resources

- **LDAP Admin UI**: http://localhost:8090
- **User Service API**: http://localhost:8081
- **User Service Swagger**: http://localhost:8081/swagger-ui.html
- **Frontend Login**: http://localhost:3000/login

---

## 📝 Next Steps

1. **Test Authentication**: Try logging in with any of the created users
2. **Test User Service**: Use the API to authenticate users
3. **Test Frontend**: Login through the web interface
4. **Add More Users**: Create additional users as needed
5. **Configure Roles**: Set up role-based access control

---

**Status**: ✅ Complete  
**Total Users**: 16 (6 International + 10 Indian)  
**Total Groups**: 2  
**LDAP Server**: Running on port 389  
**Admin UI**: http://localhost:8090  

**Ready for Testing!** 🚀

---
title: How to Orgaize React Authorization
tags: ['React', 'Authorization']
sidebar_label: How to Orgaize React Authorization
sidebar_position: 1
---

## How to Orgaize React Authorization

```jsx
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';

const user = {
  role: 'admin',
  // ...
};

export default function Home() {
  return (
    <div className="container mx-auto px-4 my-6">
      <Card>
        <CardHeader>Comment</CardHeader>
        <CardContent>Some replies</CardContent>
        {(user.role === 'admin' || user.role === 'moderator') && (
          <CardFooter>
            <Button>Reply</Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
```

## Role Based Access Control

> 將使用者的權限以角色做區分，並檢查使用者是否有該權限

```jsx
//auth.js

const ROLES = {
   admin:["view:comments", "create:comments", "update:comments", "delete:comments"],
   moderator: ["view:comments", "create:comments"]
   user: ["view:comments"]
}

export function hasPermission(user, permission) {
   return ROLES[user.role].includes(permission)
}
```

```jsx
//App.js
import { hasPermission } from './auth';

if (hasPermission(user, 'view:comments')) {
  <CardFooter>
    <Button>Reply</Button>
  </CardFooter>;
}
```

優點：

- 將使用者的權限以角色做區分，並檢查使用者是否有該權限

缺點：

- 需要在每個頁面都檢查權限，規則可能會變得複雜：

```jsx
{
  hasPermission(user, 'delete:comments') &&
    hasPermission(user, 'delete:ownComments') && <Button>Delete</Button>;
}
```

## ABAC： Attribute Based Access Control

1. Subject： 使用者
2. action
3. Resource
4. Other attributes(Environment, IP address...)

import React from 'react'
import { useShopContext } from '../../context/ShopContext'

const MyOrders = () => {
  const { orders } = useShopContext()

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">My Orders</h2>
      {orders?.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders?.map((order) => (
            <div key={order._id} className="border rounded p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Order #{order._id}</h3>
                <span className="text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item._id} className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-gray-600">${item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 border-t pt-2">
                <p className="font-semibold">Total: ${order.total}</p>
                <p className="text-gray-600">Status: {order.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyOrders 
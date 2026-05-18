import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import {
  Package,
  Pencil,
  Trash2,
  Plus,
  RotateCcw,
} from 'lucide-react'



const GET_PRODUCTS =
  `/api/produits/getall`

const ADD_PRODUCT =
  `/api/produits/add`

const UPDATE_PRODUCT =
  `/api/produits/update`

const DELETE_PRODUCT =
  `/api/produits/delete`

function ProduitsPage() {
  const [products, setProducts] = useState([])

  const [form, setForm] = useState({
    nom: '',
    description: '',
    prix: '',
    quantite: '',
  })

  const [editingId, setEditingId] =
    useState(null)

  const [loading, setLoading] =
    useState(false)

  const fetchProducts = async () => {
    try {
      setLoading(true)

      const response = await axios.get(
        GET_PRODUCTS,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get(
              'auth_token'
            )}`,
          },
        }
      )

      setProducts(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  /* =======================================================
     HANDLE INPUT
  ======================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm({
      ...form,
      [name]: value,
    })
  }

  /* =======================================================
     ADD PRODUCT
  ======================================================= */

  const addProduct = async () => {
    try {
      await axios.post(
        ADD_PRODUCT,
        {
          nom: form.nom,
          description: form.description,
          prix: Number(form.prix),
          quantite: Number(form.quantite),
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get(
              'auth_token'
            )}`,
          },
        }
      )

      resetForm()
      fetchProducts()
    } catch (error) {
      console.error(error)
    }
  }

  /* =======================================================
     UPDATE PRODUCT
  ======================================================= */

    const updateProduct = async () => {
    try {
        await axios.put(`${UPDATE_PRODUCT}/${editingId}`,
        {
            nom: form.nom,
            description: form.description,
            prix: Number(form.prix),
            quantite: Number(form.quantite),
        },
        {
            headers: {
            Authorization: `Bearer ${Cookies.get(
                'auth_token'
            )}`,
            },
        }
        )

        alert('Product updated successfully')

        resetForm()

        fetchProducts()
    } catch (error) {
        console.error(error)

        alert(
        error.response?.data ||
            'Error updating product'
        )
    }
    }

  /* =======================================================
     DELETE PRODUCT
  ======================================================= */

  const deleteProduct = async (id) => {
  const confirmDelete = window.confirm(
    'Delete this product ?'
  )

  if (!confirmDelete) return

  try {
    await axios.delete(
      `${DELETE_PRODUCT}/${id}`,
      {
        headers: {
          Authorization: `Bearer ${Cookies.get(
            'auth_token'
          )}`,
        },
      }
    )

    alert('Product deleted successfully')

    await fetchProducts()

  } catch (error) {

    console.error(error)

    if (error.response?.status === 400) {

      alert(
        'Cannot delete product with existing retours'
      )

    } else if (
      error.response?.status === 404
    ) {

      alert('Product not found')

    } else {

      alert('Error deleting product')
    }
  }
}

  /* =======================================================
     EDIT PRODUCT
  ======================================================= */

  const editProduct = (product) => {
    setEditingId(product.id)

    setForm({
      nom: product.nom,
      description: product.description,
      prix: product.prix,
      quantite: product.quantite,
    })
  }

  /* =======================================================
     RESET
  ======================================================= */

  const resetForm = () => {
    setEditingId(null)

    setForm({
      nom: '',
      description: '',
      prix: '',
      quantite: '',
    })
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f4f7fb',
        padding: '30px',
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '30px',
        }}
      >
        <Package size={34} color="#2563eb" />

        <div>
          <h1
            style={{
              margin: 0,
              color: '#1e293b',
            }}
          >
            Gestion Produits
          </h1>

          <p
            style={{
              margin: 0,
              color: '#64748b',
            }}
          >
            Manage your products easily
          </p>
        </div>
      </div>

      {/* FORM CARD */}

      <div
        style={{
          background: 'white',
          padding: '25px',
          borderRadius: '16px',
          boxShadow:
            '0 4px 12px rgba(0,0,0,0.08)',
          marginBottom: '30px',
        }}
      >
        <h2
          style={{
            marginBottom: '20px',
            color: '#1e293b',
          }}
        >
          {editingId
            ? 'Update Product'
            : 'Add Product'}
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '15px',
          }}
        >
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            value={form.nom}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            type="text"
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            type="number"
            name="prix"
            placeholder="Prix"
            value={form.prix}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            type="number"
            name="quantite"
            placeholder="Quantite"
            value={form.quantite}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div
          style={{
            marginTop: '20px',
            display: 'flex',
            gap: '12px',
          }}
        >
          {editingId ? (
            <button
              onClick={updateProduct}
              style={primaryButton}
            >
              <Pencil size={18} />
              Update
            </button>
          ) : (
            <button
              onClick={addProduct}
              style={primaryButton}
            >
              <Plus size={18} />
              Add Product
            </button>
          )}

          <button
            onClick={resetForm}
            style={secondaryButton}
          >
            <RotateCcw size={18} />
            Reset
          </button>
        </div>
      </div>

      {/* TABLE */}

      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow:
            '0 4px 12px rgba(0,0,0,0.08)',
        }}
      >
        {loading ? (
          <p
            style={{
              padding: '20px',
            }}
          >
            Loading...
          </p>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}
          >
            <thead
              style={{
                background: '#2563eb',
                color: 'white',
              }}
            >
              <tr>
                <th style={thStyle}>Nom</th>
                <th style={thStyle}>
                  Description
                </th>
                <th style={thStyle}>Prix</th>
                <th style={thStyle}>
                  Quantite
                </th>
                <th style={thStyle}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      padding: '20px',
                      textAlign: 'center',
                    }}
                  >
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    style={{
                      borderBottom:
                        '1px solid #e2e8f0',
                    }}
                  >
                    <td style={tdStyle}>
                      {product.nom}
                    </td>

                    <td style={tdStyle}>
                      {product.description}
                    </td>

                    <td style={tdStyle}>
                      {product.prix} DT
                    </td>

                    <td style={tdStyle}>
                      {product.quantite}
                    </td>

                    <td style={tdStyle}>
                      <div
                        style={{
                          display: 'flex',
                          gap: '10px',
                        }}
                      >
                        <button
                          onClick={() =>
                            editProduct(product)
                          }
                          style={
                            editButton
                          }
                        >
                          <Pencil
                            size={16}
                          />
                        </button>

                        <button
                          onClick={() =>
                            deleteProduct(
                              product.id
                            )
                          }
                          style={
                            deleteButton
                          }
                        >
                          <Trash2
                            size={16}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

/* =======================================================
   STYLES
======================================================= */

const inputStyle = {
  padding: '12px',
  borderRadius: '10px',
  border: '1px solid #cbd5e1',
  outline: 'none',
  fontSize: '14px',
}

const primaryButton = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: '#2563eb',
  color: 'white',
  border: 'none',
  padding: '12px 18px',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: '600',
}

const secondaryButton = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: '#e2e8f0',
  color: '#1e293b',
  border: 'none',
  padding: '12px 18px',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: '600',
}

const editButton = {
  background: '#facc15',
  border: 'none',
  padding: '8px',
  borderRadius: '8px',
  cursor: 'pointer',
  color: 'white',
}

const deleteButton = {
  background: '#ef4444',
  border: 'none',
  padding: '8px',
  borderRadius: '8px',
  cursor: 'pointer',
  color: 'white',
}

const thStyle = {
  padding: '16px',
  textAlign: 'left',
}

const tdStyle = {
  padding: '16px',
}

export default ProduitsPage
import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

const itemValidationSchema = Yup.object({
  item_name: Yup.string()
    .trim()
    .required("Item name is required.")
    .max(100, "Item name cannot exceed 100 characters."),

  description: Yup.string()
    .trim()
    .required("Description is required."),

  cost_price: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value
    )
    .typeError("Cost price must be a valid number.")
    .required("Cost price is required.")
    .min(0, "Cost price cannot be negative.")
    .test(
      "decimal-places",
      "Cost price can have at most 2 decimal places.",
      (value) =>
        value == null ||
        Math.abs(value * 100 - Math.round(value * 100)) < 0.000001
    ),

  sell_price: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value
    )
    .typeError("Selling price must be a valid number.")
    .required("Selling price is required.")
    .min(0, "Selling price cannot be negative.")
    .test(
      "decimal-places",
      "Selling price can have at most 2 decimal places.",
      (value) =>
        value == null ||
        Math.abs(value * 100 - Math.round(value * 100)) < 0.000001
    ),

  category: Yup.string()
    .trim()
    .required("Category is required."),

  quantity: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value
    )
    .typeError("Stock quantity must be a valid number.")
    .required("Stock quantity is required.")
    .integer("Stock quantity must be a whole number.")
    .min(0, "Stock quantity cannot be negative."),
});

const errorStyle = {
  color: "#dc2626",
  fontSize: "13px",
  marginTop: "5px",
};

function ItemForm({
  editingItem,
  formData,
  onChange,
  onSubmit,
  onCancel,
  loading,
  selectedFiles,
  onFileChange,
  onRemoveSelectedFile,
  existingImages,
  imagesToRemove,
  onToggleExistingImageRemoval,
}) {
  const [previewImages, setPreviewImages] = useState([]);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    const previews = selectedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPreviewImages(previews);

    return () => {
      previews.forEach((preview) =>
        URL.revokeObjectURL(preview.url)
      );
    };
  }, [selectedFiles]);

  const initialValues = {
    item_name: formData?.item_name ?? "",
    description: formData?.description ?? "",
    cost_price: formData?.cost_price ?? "",
    sell_price: formData?.sell_price ?? "",
    category: formData?.category ?? "",
    quantity: formData?.quantity ?? "",
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);
    const currentCount = selectedFiles.length;
    const availableSlots = Math.max(0, 10 - currentCount);

    if (files.length > availableSlots) {
      setImageError(
        `You can select up to 10 new images. You can add ${availableSlots} more.`
      );
      event.target.value = "";
      return;
    }

    const oversizedFile = files.find(
      (file) => file.size > 5 * 1024 * 1024
    );

    if (oversizedFile) {
      setImageError(
        `${oversizedFile.name} exceeds the 5 MB file size limit.`
      );
      event.target.value = "";
      return;
    }

    const invalidFile = files.find(
      (file) => !file.type.startsWith("image/")
    );

    if (invalidFile) {
      setImageError("Please select image files only.");
      event.target.value = "";
      return;
    }

    setImageError("");
    onFileChange(event);
  };

  return (
    <section>
      <h2>{editingItem ? "Edit Product" : "Add Product"}</h2>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={itemValidationSchema}
        onSubmit={async (values, helpers) => {
          try {
            // Keep the existing parent form state synchronized.
            Object.entries(values).forEach(([name, value]) => {
              onChange({
                target: {
                  name,
                  value: String(value),
                },
              });
            });

            // The parent must accept validated values, rather than
            // relying on a form event and potentially stale formData.
            await onSubmit(values);
          } finally {
            helpers.setSubmitting(false);
          }
        }}
      >
        {({
          errors,
          touched,
          isSubmitting,
          handleBlur,
        }) => (
          <Form noValidate>
            <div>
              <label htmlFor="item_name">Item Name</label>
              <Field
                id="item_name"
                type="text"
                name="item_name"
                maxLength={100}
                onBlur={handleBlur}
                aria-invalid={Boolean(
                  touched.item_name && errors.item_name
                )}
                aria-describedby="item_name-error"
              />
              {touched.item_name && errors.item_name && (
                <div id="item_name-error" style={errorStyle}>
                  {errors.item_name}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="description">Description</label>
              <Field
                as="textarea"
                id="description"
                name="description"
                onBlur={handleBlur}
                aria-invalid={Boolean(
                  touched.description && errors.description
                )}
                aria-describedby="description-error"
              />
              {touched.description && errors.description && (
                <div id="description-error" style={errorStyle}>
                  {errors.description}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="cost_price">Cost Price</label>
              <Field
                id="cost_price"
                type="number"
                name="cost_price"
                min="0"
                step="0.01"
                onBlur={handleBlur}
                aria-invalid={Boolean(
                  touched.cost_price && errors.cost_price
                )}
                aria-describedby="cost_price-error"
              />
              {touched.cost_price && errors.cost_price && (
                <div id="cost_price-error" style={errorStyle}>
                  {errors.cost_price}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="sell_price">Selling Price</label>
              <Field
                id="sell_price"
                type="number"
                name="sell_price"
                min="0"
                step="0.01"
                onBlur={handleBlur}
                aria-invalid={Boolean(
                  touched.sell_price && errors.sell_price
                )}
                aria-describedby="sell_price-error"
              />
              {touched.sell_price && errors.sell_price && (
                <div id="sell_price-error" style={errorStyle}>
                  {errors.sell_price}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="category">Category</label>
              <Field
                id="category"
                type="text"
                name="category"
                onBlur={handleBlur}
                aria-invalid={Boolean(
                  touched.category && errors.category
                )}
                aria-describedby="category-error"
              />
              {touched.category && errors.category && (
                <div id="category-error" style={errorStyle}>
                  {errors.category}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="quantity">Stock Quantity</label>
              <Field
                id="quantity"
                type="number"
                name="quantity"
                min="0"
                step="1"
                onBlur={handleBlur}
                aria-invalid={Boolean(
                  touched.quantity && errors.quantity
                )}
                aria-describedby="quantity-error"
              />
              {touched.quantity && errors.quantity && (
                <div id="quantity-error" style={errorStyle}>
                  {errors.quantity}
                </div>
              )}
            </div>

            <hr />

            <div>
              <label htmlFor="item-images">Product Images</label>
              <p>
                Select image files up to 5 MB each. You can select
                up to 10 new images.
              </p>

              <input
                id="item-images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />

              {imageError && (
                <p role="alert" style={errorStyle}>
                  {imageError}
                </p>
              )}
            </div>

            {existingImages.length > 0 && (
              <div>
                <h3>Current Images</h3>
                <p>
                  Mark images you want to remove when you save
                  your changes.
                </p>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  {existingImages.map((image) => {
                    const markedForRemoval =
                      imagesToRemove.includes(image._id);

                    return (
                      <div
                        key={image._id || image.image_path}
                        style={{
                          width: 150,
                          border: "1px solid #ccc",
                          padding: 8,
                        }}
                      >
                        <img
                          src={image.image_path}
                          alt="Existing product"
                          style={{
                            width: "100%",
                            height: 100,
                            objectFit: "cover",
                            opacity: markedForRemoval ? 0.4 : 1,
                          }}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            onToggleExistingImageRemoval(image._id)
                          }
                          disabled={!image._id}
                        >
                          {markedForRemoval
                            ? "Keep Image"
                            : "Remove Image"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {previewImages.length > 0 && (
              <div>
                <h3>New Image Previews</h3>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  {previewImages.map((preview, index) => (
                    <div
                      key={`${preview.file.name}-${index}`}
                      style={{
                        width: 150,
                        border: "1px solid #ccc",
                        padding: 8,
                      }}
                    >
                      <img
                        src={preview.url}
                        alt={preview.file.name}
                        style={{
                          width: "100%",
                          height: 100,
                          objectFit: "cover",
                        }}
                      />

                      <p>{preview.file.name}</p>

                      <button
                        type="button"
                        onClick={() =>
                          onRemoveSelectedFile(index)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <br />

            <button
              type="submit"
              disabled={loading || isSubmitting}
            >
              {loading || isSubmitting
                ? "Saving..."
                : editingItem
                  ? "Update Product"
                  : "Create Product"}
            </button>

            {editingItem && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading || isSubmitting}
              >
                Cancel
              </button>
            )}
          </Form>
        )}
      </Formik>
    </section>
  );
}

export default ItemForm;

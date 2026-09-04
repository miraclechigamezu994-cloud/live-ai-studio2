import gradio as gr
from PIL import Image


def process_face(face_image, camera_image):
    """
    Receives the selected face and camera image.

    The actual AI face-swap model will be connected here.
    """

    if camera_image is None:
        return None

    # Temporary output so we can confirm
    # that the backend is receiving the image.
    return camera_image


with gr.Blocks(
    title="Live AI Studio"
) as demo:

    gr.Markdown(
        "# ✦ Live AI Studio\n"
        "Real-time camera transformation studio"
    )

    with gr.Row():

        face_input = gr.Image(
            label="Choose Face",
            type="pil"
        )

        camera_input = gr.Image(
            label="Camera Image",
            type="pil"
        )

    output = gr.Image(
        label="AI Output"
    )

    process_button = gr.Button(
        "✨ Process Face"
    )

    process_button.click(
        fn=process_face,
        inputs=[
            face_input,
            camera_input
        ],
        outputs=output
    )


if __name__ == "__main__":
    demo.launch()

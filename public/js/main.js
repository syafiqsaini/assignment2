$(document).ready(()=>{
    $('.delete-product').on('click', (e)=>{
        $target = $(e.target);
        const id = $target.attr('data-id');
        $.ajax({
            type: 'DELETE',
            url: '/product/'+id,
            success: (response)=>{
                alert('Deleting product');
                window.location.href = '/';
            },
            error: (err)=>{
                console.log(err);
            }
        });
    });
});